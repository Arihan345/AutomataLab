# AutomataLab — Progress Notes

## Done & verified (logic-correct, tested via data/trace, not just visuals)
- Module 1 (Regex → NFA → DFA → Minimal DFA): parser, Thompson's Construction,
  subset construction, minimization — all verified.
- Module 2 (PDA): JSON input, stack simulator (push-order bug fixed), rendering.
- Module 3 (CFG): text-based grammar parser (CNF only, single-char symbols),
  CYK algorithm, parse tree construction — verified correct on "S -> AB | a"
  test case (accepts "ab", rejects "aa").
- Full-stack: Express + Prisma + Postgres, generic Automaton model, zero backend
  changes needed per new module type (confirmed for dfa/nfa/pda/cfg).
- Routing: react-router-dom, Home + NavBar + per-module pages.

## Cosmetic issues list (deferred — fix in one consolidated pass after Module 4)
1. Dense DFA/NFA graphs: overlapping edge labels when multiple edges share the
   same source/target pair, or same-height node pairs. Partial mitigations in
   place (self-loop badges, merged multi-symbol edge labels) but not exhaustive.
2. Parse tree viewer (CFGPage): nodes render without connecting lines between
   parent and children — looks like a grid of boxes instead of a tree.
   Fix identified (small vertical connector div) but not yet applied.
3. General layout: inline styles everywhere, no shared theme/spacing system.
   Needs a proper CSS/theme pass once all 4 modules exist.
4. No loading states or global error handling for backend calls (save/load fail
   silently into a status text line — functional but not polished).

## Next up
- Module 4: Turing Machines (tape, step execution, step limit for non-halting)
- After Module 4: ONE consolidated pass covering all 4 items above, rather than
  fixing per-module as issues are found (lesson from Day 2's edge-rendering
  detour — context-switching between logic and rendering costs more time than
  batching the rendering work).

## Key reusable patterns (proven across 3 modules now)
- types/X.ts first, always
- Pure logic in lib/, tested via console.log before any UI
- SaveLoadPanel + backend: zero changes needed, just pass a new `type` string
- Small custom text parser > JSON when the domain object is naturally
  line/text-shaped (regex, CFG grammar) — JSON when it's naturally a graph/
  structured object (PDA transitions, TM transitions)