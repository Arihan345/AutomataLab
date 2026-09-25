# AutomataLab

**Live demo: [automata-lab-ten.vercel.app](https://automata-lab-ten.vercel.app)**

AutomataLab is an interactive formal language theory laboratory covering five modules — Manual DFA, Regex → NFA → DFA → Minimal DFA, Pushdown Automata, Context-Free Grammars (CYK), and Turing Machines. It isn't a set of static diagrams: every module is interactive. You can build a DFA by clicking states and transitions into existence, generate one automatically from a regular expression and watch Thompson's Construction and subset construction unfold step by step, run real input strings through a PDA or Turing Machine and see the stack or tape update live, and step through a CYK parse with an interactive tree. Beyond visualizing known algorithms, the project also includes a from-scratch DFA equivalence checker that, given two automata, determines whether they accept the same language and, if not, produces a concrete counterexample string — genuine algorithmic work, not a textbook diagram. Every core algorithm — the regex parser, Thompson's Construction, subset construction, minimization, CYK, PDA and TM simulation, and the equivalence checker — has its own unit test suite that runs independently of React, so correctness is something you can verify by running a command, not something you have to take on trust.

## Tech Stack

**Frontend:** React, TypeScript, Vite, React Flow for automaton graph rendering, custom SVG for parse trees and PDA/TM visualizations.
**Backend:** Express, Prisma, PostgreSQL.

## Architecture

Every algorithm runs entirely client-side, in the browser — the backend's only job is persistence. This has a real consequence for scale: since the expensive computation (Thompson's Construction, subset construction, CYK, and so on) happens independently in each user's own browser, it scales for free with more users; the backend only has to handle save and load traffic. Automata of every type — DFA, NFA, PDA, CFG, TM — are persisted through a single generic `Automaton { type, name, data: Json }` model, where `data` holds the full structure for whichever type it is. This was a deliberate tradeoff: schema flexibility during active development, when a new automaton type was being added roughly once a day, mattered more than database-level integrity guarantees on the JSON's internal shape. The cost of that choice — that the database itself can't enforce that a transition points to a real state — is closed on the application side instead, via backend input validation that rejects a malformed automaton with a clear error before it ever reaches Postgres.

## Correctness

Every core algorithm is backed by tests that check actual expected output, not just that the app renders something. Thompson's Construction is verified by comparing generated state and transition counts against hand-computed values for regexes like `a`, `a|b`, `a*`, and `a(b|c)*d`. Subset construction is checked against known accept/reject tables for those same patterns. DFA minimization is verified to preserve language equivalence — the same accept/reject behavior on a string test set before and after minimizing — not just to produce fewer states; the partition-refinement history behind that process is also recorded and independently inspectable through the app's own step-through UI. CYK is tested against a known Chomsky Normal Form grammar with a known parse tree, including a rejecting case. PDA simulation is tested for correct stack discipline, including a backtracking fix for a real limitation found during development: a naive single-path simulator that always picks the same kind of transition first can wrongly reject a string that actually has a valid accepting path reachable only through an epsilon transition. Turing Machine simulation is tested across accepting, rejecting, and step-limit-reached outcomes as three distinct cases. The equivalence checker is tested against DFAs of different sizes that are genuinely equivalent (expecting no counterexample) and against DFAs that are not (expecting a real, independently verifiable counterexample string).

Run the suite yourself:
```bash
cd AutomataLab-new && npm test        # frontend
cd AutomataLab-new/server && npm test # backend
```

One known, honest limitation: the PDA simulator's "no valid transition found, halted immediately" explanation currently keys off a literal step count, which can under-fire on a PDA with an available epsilon branch that gets explored before the machine gives up — meaning `steps.length` can be greater than 1 even when no real forward progress was made. The underlying backtracking fix itself is correct and tested; this is a wording edge case in the explanation panel, not a correctness issue in the simulation itself.

## Getting Started

```bash
git clone https://github.com/Arihan345/AutomataLab.git
cd AutomataLab/AutomataLab-new

# frontend
npm install
cp .env.example .env   # set VITE_API_URL if the backend isn't on localhost:4000

# backend
cd server
npm install
cp .env.example .env   # set DATABASE_URL (a running Postgres instance) and FRONTEND_URL
npx prisma migrate deploy
```

Then, in two terminals:
```bash
cd AutomataLab-new/server && npm run dev   # backend
cd AutomataLab-new && npm run dev          # frontend
```
Open the printed local URL — typically `http://localhost:5173`.

## Deployment

The live site runs on managed platforms with no Docker or containerization involved — Vercel handles the frontend, Render handles the backend and its Postgres instance, and both manage environment consistency natively without needing a container. On Vercel, the project's root directory is set to `AutomataLab-new` so it finds the Vite app correctly, and `VITE_API_URL` is set as a build-time environment variable pointing at the live backend — since it's baked in at build time, changing it requires a redeploy, not just a settings update. On Render, the backend's root directory is `AutomataLab-new/server`, its `DATABASE_URL` points at a Render-managed Postgres instance, and `FRONTEND_URL` is set to the live Vercel URL to scope CORS correctly. One real deployment issue worth flagging honestly: a fresh install on a clean platform doesn't automatically run `prisma generate`, unlike a local machine where it's often already been run and cached — without a `postinstall` script calling it explicitly, the backend fails immediately with a `PrismaClient` export error on first boot. Migrations against the production database were applied by running `npx prisma migrate deploy` locally, pointed at the database's *external* connection string, since Render's free tier doesn't provide interactive shell access to run it from within the platform itself.

The backend runs on a free tier, which spins down after a period of inactivity — the first request after idle can take 30 to 60 seconds while the instance wakes up. Save and load actions show a loading indicator specifically to account for this, so the delay reads as "working" rather than "broken."

## Project Structure
AutomataLab-new/
├── src/
│ ├── lib/ # pure algorithm logic — parser, Thompson's Construction,
│ │ # subset construction, minimization, CYK, PDA/TM
│ │ # simulation, DFA equivalence — fully unit tested,
│ │ # zero React dependency
│ └── components/ # one page per module, shared UI primitives, React Flow
│ # node/edge renderers, custom SVG viewers for parse
│ # trees and PDA/TM visualizations
└── server/
├── src/ # Express routes and input validation
└── prisma/ # schema and migrations

Algorithm logic and UI are kept deliberately separate. It makes the core logic testable without any rendering concerns at all, and it means a genuinely new automaton type mostly touches `lib/` and one new page component — the backend's generic schema and the shared UI primitives need little or no change, which is exactly what let five different automaton types get added across this project without ever rewriting the persistence layer.

## What I'd Build Next

Multi-user accounts were scoped out deliberately — the app currently has a single shared save space, and adding real ownership would mean a `User` model, a foreign key on every saved automaton, and authentication middleware (bcrypt/JWT, or a library like Passport rather than hand-rolled session handling) scoping every route to the logged-in user. That was set aside in favor of algorithm depth and correctness work, which mattered more for what this project set out to demonstrate. The PDA halt-message wording edge case noted above is a small, already-understood fix rather than an open problem. And while nothing about the current scale needs it, the path to handling much higher concurrent load is already worked out: a connection pooler like PgBouncer in front of Postgres, and horizontally scaling the stateless Express layer behind a load balancer — neither implemented, both deliberately deferred rather than overlooked.

## License

MIT
