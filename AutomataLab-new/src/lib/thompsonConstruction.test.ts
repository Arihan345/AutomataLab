import { describe, it, expect } from 'vitest';
import { buildNFAFromRegexNode, fragmenttoNFA, type NFAFragment } from './thompsonConstruction';
import { parseUnion, ParserState } from './regexParser';
import type { RegexNode } from '../types/regex';

function parse(pattern: string): RegexNode {
  return parseUnion(new ParserState(pattern));
}

function countTransitions(fragment: NFAFragment): number {
  return Object.values(fragment.transitions).reduce(
    (sum, bySymbol) => sum + Object.values(bySymbol).reduce((s, targets) => s + targets.length, 0),
    0
  );
}

describe('buildNFAFromRegexNode (Thompson\'s Construction)', () => {
  it('"a" produces a 2-state, 1-transition fragment', () => {
    const fragment = buildNFAFromRegexNode(parse('a'));
    expect(fragment.states).toHaveLength(2);
    expect(countTransitions(fragment)).toBe(1);
  });

  it('"a|b" produces a 6-state, 6-transition fragment', () => {
    const fragment = buildNFAFromRegexNode(parse('a|b'));
    expect(fragment.states).toHaveLength(6);
    expect(countTransitions(fragment)).toBe(6);
  });

  it('"a*" produces a 4-state, 5-transition fragment', () => {
    const fragment = buildNFAFromRegexNode(parse('a*'));
    expect(fragment.states).toHaveLength(4);
    expect(countTransitions(fragment)).toBe(5);
  });

  it('"a(b|c)*d" produces a 12-state, 14-transition fragment', () => {
    // a: 2 states/1 edge, b: 2/1, c: 2/1
    // (b|c): +2 states +4 edges -> 6 states / 6 edges
    // (b|c)*: +2 states +4 edges -> 8 states / 10 edges
    // a . (b|c)*: +0 states +1 edge -> 10 states / 12 edges
    // d: 2 states / 1 edge
    // (a(b|c)*) . d: +0 states +1 edge -> 12 states / 14 edges
    const fragment = buildNFAFromRegexNode(parse('a(b|c)*d'));
    expect(fragment.states).toHaveLength(12);
    expect(countTransitions(fragment)).toBe(14);
  });

  it('fragmenttoNFA sets start/accept and derives the alphabet excluding epsilon', () => {
    const fragment = buildNFAFromRegexNode(parse('a|b'));
    const nfa = fragmenttoNFA(fragment, 1, 'test', '');
    expect(nfa.startState).toBe(fragment.start);
    expect(nfa.acceptStates).toEqual([fragment.accept]);
    expect(new Set(nfa.alphabet)).toEqual(new Set(['a', 'b']));
  });
});
