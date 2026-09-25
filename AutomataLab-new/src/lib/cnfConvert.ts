import type { CFG, Production } from '../types/cfg';

// Converts an arbitrary CFG (rules with any right-hand-side length, and any
// mix of terminals/variables) into an equivalent grammar in Chomsky Normal
// Form: every production is either `A -> a` (a single terminal) or
// `A -> BC` (exactly two variables). Already-CNF productions pass through
// unchanged — no wrapper or chain variable is introduced for them.
//
// Two standard CNF transformations are applied, in order:
//
//   1. TERM: replace every terminal that appears alongside another symbol
//      on a right-hand side (a "mixed" rule) with a fresh terminal-wrapper
//      variable T_x, adding one production T_x -> x per terminal.
//   2. BIN:  replace every right-hand side longer than 2 symbols with a
//      chain of fresh variables, so A -> X1 X2 X3 ... Xn becomes
//      A -> X1 Y1, Y1 -> X2 Y2, ..., Y(n-2) -> X(n-1) Xn.
//
// This does not eliminate epsilon- or unit-productions: the app's grammar
// text format has no epsilon syntax, and a unit production (A -> B) is left
// as-is — CYK simply won't match it, the same limitation the previous
// strict-CNF-only parser had for any rule it didn't understand.
export function convertToCNF(cfg: CFG): CFG {
  const isTerminal = (sym: string) => cfg.terminals.includes(sym);
  const variables = new Set(cfg.variables);
  const terminalWrappers = new Map<string, string>();
  let freshCounter = 0;

  function freshName(prefix: string): string {
    let name: string;
    do {
      name = `${prefix}${freshCounter++}`;
    } while (variables.has(name));
    variables.add(name);
    return name;
  }

  function wrapperFor(terminal: string): string {
    const existing = terminalWrappers.get(terminal);
    if (existing) return existing;
    const name = freshName('T');
    terminalWrappers.set(terminal, name);
    return name;
  }

  const result: Production[] = [];

  for (const p of cfg.productions) {
    // Already CNF: A -> a
    if (p.right.length === 1 && isTerminal(p.right[0])) {
      result.push(p);
      continue;
    }
    // Already CNF: A -> BC (two variables)
    if (p.right.length === 2 && p.right.every((s) => !isTerminal(s))) {
      result.push(p);
      continue;
    }

    // TERM: wrap any terminal that shares a rule with other symbols
    const symbols = p.right.map((s) => (isTerminal(s) ? wrapperFor(s) : s));

    // BIN: binarize down to a chain of length-2 rules
    if (symbols.length === 1) {
      // A unit production (A -> B) after wrapping — nothing left to binarize.
      result.push({ left: p.left, right: symbols });
      continue;
    }
    let left = p.left;
    for (let i = 0; i < symbols.length - 2; i++) {
      const next = freshName('X');
      result.push({ left, right: [symbols[i], next] });
      left = next;
    }
    result.push({ left, right: [symbols[symbols.length - 2], symbols[symbols.length - 1]] });
  }

  terminalWrappers.forEach((wrapperVar, terminal) => {
    result.push({ left: wrapperVar, right: [terminal] });
  });

  return { ...cfg, variables: [...variables], productions: result };
}
