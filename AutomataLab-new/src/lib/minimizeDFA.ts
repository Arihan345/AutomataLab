import type { DFA } from '../types/automaton';

export function minimizeDFA(dfa: DFA, id: number, name: string, description: string): DFA {
  const accept = new Set(dfa.acceptStates);
  const nonAccept = dfa.states.filter((s) => !accept.has(s));
  let partitions: string[][] = [dfa.states.filter((s) => accept.has(s)), nonAccept].filter((p) => p.length > 0);

  let changed = true;
  while (changed) {
    changed = false;
    const newPartitions: string[][] = [];

    for (const group of partitions) {
      const subgroups = new Map<string, string[]>();

      for (const state of group) {
        const signature = dfa.alphabet
          .map((symbol) => {
            const target = dfa.transitions[state]?.[symbol];
            const targetGroupIndex = partitions.findIndex((g) => g.includes(target));
            return targetGroupIndex;
          })
          .join(',');

        if (!subgroups.has(signature)) subgroups.set(signature, []);
        subgroups.get(signature)!.push(state);
      }

      const split = [...subgroups.values()];
      if (split.length > 1) changed = true;
      newPartitions.push(...split);
    }

    partitions = newPartitions;
  }

  const groupId = (state: string) => {
    const idx = partitions.findIndex((g) => g.includes(state));
    return `m${idx}`;
  };

  const minStates = partitions.map((_, idx) => `m${idx}`);
  const minTransitions: Record<string, Record<string, string>> = {};

  partitions.forEach((group, idx) => {
    const rep = group[0];
    minTransitions[`m${idx}`] = {};
    dfa.alphabet.forEach((symbol) => {
      const target = dfa.transitions[rep]?.[symbol];
      if (target) minTransitions[`m${idx}`][symbol] = groupId(target);
    });
  });

  const minAccept = minStates.filter((mid) => {
    const idx = parseInt(mid.replace('m', ''));
    return partitions[idx].some((s) => dfa.acceptStates.includes(s));
  });

  return {
    id,
    name,
    description,
    states: minStates,
    alphabet: dfa.alphabet,
    transitions: minTransitions,
    startState: groupId(dfa.startState),
    acceptStates: minAccept,
  };
}