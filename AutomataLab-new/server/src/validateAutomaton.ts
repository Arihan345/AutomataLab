export type ValidationResult = { valid: true } | { valid: false; error: string };

// Walks an automaton's `transitions` value looking for state references.
// Handles every shape used across the app's automaton types without
// needing to branch on `type`:
//   - a string is a direct target state (DFA)
//   - an array is walked element by element (NFA's string[] targets, or a
//     PDA transition's list of alternatives)
//   - an object with a `newState` field is a transition result (PDA/TM) —
//     only `newState` is a state reference; sibling fields like `push`,
//     `write`, `move` are not
//   - any other object (a state's or symbol's lookup table) is walked by
//     its values, not its keys
function collectStateReferences(value: unknown, into: Set<string>): void {
  if (typeof value === 'string') {
    into.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectStateReferences(v, into));
  } else if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.newState === 'string') {
      into.add(obj.newState);
    } else {
      Object.values(obj).forEach((v) => collectStateReferences(v, into));
    }
  }
}

// Basic structural validation for the "states/startState/transitions"
// shape shared by DFA, NFA, PDA, and TM automata. CFG's data shape
// (variables/startSymbol/productions) is structurally different and isn't
// covered here.
export function validateAutomatonData(type: string, data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: '"data" must be an object' };
  }
  if (type === 'cfg') {
    return { valid: true };
  }

  const d = data as Record<string, unknown>;

  if (!Array.isArray(d.states) || d.states.length === 0 || !d.states.every((s) => typeof s === 'string')) {
    return { valid: false, error: '"states" must be a non-empty array of state names' };
  }
  const states = new Set(d.states as string[]);

  if (typeof d.startState !== 'string' || !states.has(d.startState)) {
    return { valid: false, error: '"startState" must be one of the states listed in "states"' };
  }

  if (d.transitions && typeof d.transitions === 'object') {
    const referenced = new Set<string>();
    collectStateReferences(d.transitions, referenced);
    for (const target of referenced) {
      if (!states.has(target)) {
        return { valid: false, error: `transitions reference an unknown state "${target}"` };
      }
    }
  }

  return { valid: true };
}
