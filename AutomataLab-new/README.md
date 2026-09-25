# AutomataLab

An interactive playground for formal language theory: build, transform, and
simulate automata step by step. React + TypeScript + Vite on the frontend,
Express + Prisma + PostgreSQL on the backend.

## Overview

AutomataLab covers the core automata theory pipeline end to end:

- **DFA** — paste a JSON definition or build one interactively by clicking on
  a canvas, then simulate a string against it step by step.
- **Regex → NFA → DFA → Minimal DFA** — Thompson's construction, subset
  construction, and Hopcroft-style partition-refinement minimization, with
  every stage of the pipeline separately inspectable, including a
  round-by-round visualization of the minimization's partition refinement.
- **PDA** — simulate a pushdown automaton with a live stack view. Transitions
  are genuinely nondeterministic (backtracking search over all branches, not
  a "take the first option" shortcut).
- **CFG / CYK** — parse a context-free grammar with the CYK algorithm and
  inspect the resulting parse tree. Grammars don't need to already be in
  Chomsky Normal Form — general right-hand sides are converted to CNF
  automatically before parsing.
- **Turing Machine** — step through tape computation with an interactive
  tape/head view.
- **DFA equivalence checker** — compare two DFAs for language equivalence via
  minimization + product-automaton BFS, with a counterexample string when
  they differ.

Every simulator that produces a step trace (DFA, PDA, CFG's parse tree, TM)
has a synchronized step-through UI with a plain-language "what just happened"
explanation panel.

## Tech stack

**Frontend:** React 19, TypeScript, Vite 8, React Router, `@xyflow/react`
(React Flow) for automaton graph rendering, Vitest for testing.

**Backend:** Express 5, Prisma 7 (`@prisma/adapter-pg`), PostgreSQL — a thin
REST API (`POST /automata`, `GET /automata`, `GET /automata/:id`) for saving
and loading automaton definitions as JSON blobs.

No global state library — each page owns its own state via `useState`/local
derived values; automaton objects are passed down as plain data.

## Architecture

```
Browser (Vite dev server / static build)
   │  fetch()
   ▼
Express API (server/src/index.ts)
   │  Prisma Client (adapter-pg)
   ▼
PostgreSQL  (single `Automaton` table: id, type, name, description, data JSON)
```

The frontend has no build-time dependency on the backend — every module's
core logic (`src/lib/*.ts`) is pure, framework-free TypeScript that takes a
typed automaton object and returns a result; the backend is only touched for
Save/Load. This is why the algorithms are unit-testable in isolation without
spinning up a server or a browser.

The Regex module is the deepest pipeline: `regexParser.ts` (recursive-descent
parser, produces a `RegexNode` tree) → `thompsonConstruction.ts` (tree → NFA
fragment) → `subsetConstruction.ts` (NFA → DFA) → `minimizeDFA.ts` (DFA →
minimal DFA, plus the partition-refinement history used by
`PartitionStepViewer.tsx`). Each stage is rendered as its own pipeline step
in `RegexPage.tsx`, re-derived on every render from the current NFA rather
than cached in state.

## Correctness

66 tests across 11 files (`npm test`, Vitest), all colocated with the logic
they cover in `src/lib/`:

| File | Tests | What it checks |
|---|---|---|
| `simulate.test.ts` | 6 | DFA simulation accept/reject on a known language |
| `thompsonConstruction.test.ts` | 5 | NFA state/transition counts for `a`, `a\|b`, `a*`, `a(b\|c)*d`, hand-computed and verified — not just "it renders" |
| `subsetConstruction.test.ts` | 6 | NFA→DFA correctness against `a(b\|c)*d`'s accept/reject set |
| `minimizeDFA.test.ts` | 12 | Deliberately non-minimal DFA merges to fewer states while staying behaviorally equivalent; partition-refinement history is correct round by round |
| `cyk.test.ts` | 4 | CYK parse tree shape against a known CNF grammar |
| `parseGrammar.test.ts` | 3 | General (non-CNF) grammars — long and mixed right-hand sides — parse and CYK-accept correctly after auto-CNF-conversion; already-CNF grammars are unaffected |
| `cnfConvert.test.ts` | 5 | The CNF converter itself: already-CNF passthrough, binarization, terminal-wrapping, wrapper reuse |
| `regexParser.test.ts` | 12 | `+` and `?` operators, including combined with `\|` and `*` |
| `simulatePDA.test.ts` | 6 | Balanced-parentheses accept/reject/stuck cases, plus a PDA specifically constructed to prove the backtracking search recovers from a wrong first branch (a naive "always take option 0" simulator provably rejects a string this one correctly accepts) |
| `simulateTM.test.ts` | 3 | Binary-increment TM (including the carry/all-ones case) and a deliberately non-halting machine that correctly hits the step limit |
| `dfaEquivalence.test.ts` | 4 | Equivalent DFAs of different sizes, a non-equivalent pair with a hand-verified expected counterexample, empty-language and differing-alphabet edge cases |

**Bugs found and fixed during development, not just prevented:**
- `simulatePDA`'s original "take the first available transition" logic could
  reject strings only reachable via a non-first nondeterministic branch —
  replaced with backtracking search; regression-tested against a PDA
  designed to expose exactly that failure mode.
- The PDA/TM step-explanation panels silently rendered nothing for any
  single-step simulation (no `prevStep` to diff against) — fixed to show a
  start-state summary instead, including a "no valid transition, halted
  immediately" note when applicable.
- That halt-immediately note initially used `steps.length === 1` as its
  signal, which under-fired: `simulatePDA`'s backtracking can produce a
  2+-step trace via a dead-end epsilon branch even when zero input was ever
  consumed. Replaced with a check on whether the final recorded
  `inputIndex` ever advanced past 0, which correctly distinguishes "no real
  progress" from a genuine multi-step rejection.

**Known limitations, honestly:**
- CNF conversion (`cnfConvert.ts`) does not eliminate epsilon- or
  unit-productions — the grammar text format has no epsilon syntax, and a
  unit production (`A -> B`) is left as-is (CYK simply won't match it).
- The CYK parse view doesn't have a step-through animation, so it wasn't in
  scope for the universal step-explanation panel — it's explained instead
  through the existing click-to-inspect parse tree.
- `simulatePDA`'s backtracking search is bounded by a fixed expansion budget
  (1000) and `simulateTM` by a fixed step limit (500); a pathological input
  can hit the limit and report a non-answer rather than a definitive one.
- The Save/Load backend has no delete or rename endpoint, and no per-user
  scoping — every saved automaton is globally visible to anyone hitting the
  API. Acceptable for a single-user educational tool as currently scoped,
  not for anything multi-tenant.

## Getting started

Requires Node 20.19+ or 22.12+ (per Vite 8's `engines` requirement) and a
PostgreSQL database.

**Backend:**
```bash
cd server
npm install
cp .env.example .env   # set DATABASE_URL
npx prisma migrate dev # first-time local setup; creates the Automaton table
npm run dev             # http://localhost:4000
```

**Frontend** (separate terminal, from the repo root):
```bash
npm install
npm run dev              # http://localhost:5173
```

**Other scripts:**
| Command | What it does |
|---|---|
| `npm test` | Run the Vitest suite (frontend) |
| `npm run build` | Type-check (`tsc -b`) then production-build with Vite |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Oxlint |
| `npm run migrate:deploy` (in `server/`) | `prisma migrate deploy` — production migrations, no interactive prompts |

## Project structure

```
src/
  components/        Pages (DFAPage, RegexPage, PDAPage, CFGPage, TMPage, ...)
                      and their graph/viewer/inspector sub-components
    edges/, nodes/    React Flow custom edge/node renderers
    ui/               Shared primitives (Button, Input, ControlBar, ...)
  lib/                Pure algorithm implementations + their *.test.ts files
  types/              Shared TypeScript types per automaton kind
  context/            FocusContext (the "⛶ Focus" distraction-free mode)
server/
  src/index.ts        Express API
  prisma/             Schema + migrations
```

A handful of components under `src/components/` (the per-module `*Input.tsx`
and `*Simulator.tsx` files, `ParseTreeViewer.tsx`, `AlgorithmInspector.tsx`,
`SaveLoadPanel.tsx`, `svg/DFACanvas.tsx`, `ui/BottomInspector.tsx`,
`ui/StatusPill.tsx`, `edges/MultiEdge.tsx`, and `lib/elkDfaLayout.ts`) are
leftover from an early refactor where each page's Input/Simulator logic was
absorbed inline — they're dead code, not wired into any route. Flagged here
rather than silently deleted, since removing them wasn't in scope for this
pass.

## Deployment

No Docker — this deploys directly to managed platforms that handle
environment consistency on their own.

- **Frontend** (Vercel/Netlify): build command `npm run build`, publish
  `dist/`. Set `VITE_API_URL` to the deployed backend's URL at build time
  (defaults to `http://localhost:4000` if unset).
- **Backend** (Render/Railway): start command `npm run migrate:deploy && npm run start`.
  Set `DATABASE_URL` (Postgres connection string), `CORS_ORIGIN` (the
  deployed frontend's origin — defaults to `http://localhost:5173`), and
  `PORT` if the platform doesn't inject one automatically (`process.env.PORT`
  is honored, falls back to 4000).
- Migrations: `npm run migrate:deploy` runs `prisma migrate deploy`, the
  non-interactive production variant of `prisma migrate dev` — never used
  for local development, where `migrate dev` is still correct.

**Secrets:** `server/.env` (which holds `DATABASE_URL`) is gitignored and
confirmed never committed — `git log --all --full-history` for any `.env`
file returns nothing tracked.

## What I'd build next

- Delete/rename endpoints for saved automata (currently create/list/read only).
- Expose NFA as its own explorable module/route — right now it only exists
  as an intermediate stage inside the Regex pipeline.
- A step-through for the CYK table itself, to extend the universal
  step-explanation pattern to CFG the way it already covers DFA/PDA/TM.
- Epsilon- and unit-production elimination in `cnfConvert.ts`, for full CNF
  conversion generality.
- Code-split the frontend bundle — the production build currently warns
  about a single ~575 KB JS chunk (mostly React Flow); dynamic `import()`
  per route would fix this.
- Basic backend input validation on `POST /automata` (shape-check `data`
  before persisting) and a couple of tests for it — discussed, not yet built.

Explicitly out of scope, not just deferred: multi-user auth and any kind of
horizontal scaling. This is a single-user educational tool; adding either
would be a different project.
