import { describe, it, expect } from 'vitest';
import { subsetConstruction } from './subsetConstruction';
import { buildNFAFromRegexNode, fragmenttoNFA } from './thompsonConstruction';
import { parseUnion, ParserState } from './regexParser';
import { simulateDFA } from './simulate';

function dfaForRegex(pattern: string) {
  const node = parseUnion(new ParserState(pattern));
  const fragment = buildNFAFromRegexNode(node);
  const nfa = fragmenttoNFA(fragment, 1, pattern, '');
  return subsetConstruction(nfa, 1, pattern, '');
}

describe('subsetConstruction', () => {
  const dfa = dfaForRegex('a(b|c)*d');

  it.each(['abcbcd', 'acd', 'ad'])('accepts %j', (input) => {
    expect(simulateDFA(dfa, input).accepted).toBe(true);
  });

  it.each(['abc', 'aed'])('rejects %j', (input) => {
    expect(simulateDFA(dfa, input).accepted).toBe(false);
  });

  it('produces a deterministic transition function (at most one target per state/symbol)', () => {
    for (const state of dfa.states) {
      for (const symbol of dfa.alphabet) {
        const target = dfa.transitions[state]?.[symbol];
        if (target !== undefined) {
          expect(typeof target).toBe('string');
        }
      }
    }
  });
});
