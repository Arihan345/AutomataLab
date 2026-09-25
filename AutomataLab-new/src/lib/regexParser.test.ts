import { describe, it, expect } from 'vitest';
import { parseUnion, ParserState } from './regexParser';
import { buildNFAFromRegexNode, fragmenttoNFA } from './thompsonConstruction';
import { subsetConstruction } from './subsetConstruction';
import { simulateDFA } from './simulate';

function dfaForRegex(pattern: string) {
  const node = parseUnion(new ParserState(pattern));
  const fragment = buildNFAFromRegexNode(node);
  const nfa = fragmenttoNFA(fragment, 1, pattern, '');
  return subsetConstruction(nfa, 1, pattern, '');
}

function accepts(pattern: string, input: string): boolean {
  return simulateDFA(dfaForRegex(pattern), input).accepted;
}

describe('regexParser — "+" (one or more)', () => {
  it.each(['a', 'aa', 'aaa'])('"a+" accepts %j', (input) => {
    expect(accepts('a+', input)).toBe(true);
  });

  it('"a+" rejects the empty string', () => {
    expect(accepts('a+', '')).toBe(false);
  });

  it('"a+b" accepts "ab" and "aab" but rejects "b"', () => {
    expect(accepts('a+b', 'ab')).toBe(true);
    expect(accepts('a+b', 'aab')).toBe(true);
    expect(accepts('a+b', 'b')).toBe(false);
  });
});

describe('regexParser — "?" (optional)', () => {
  it.each(['', 'a'])('"a?" accepts %j', (input) => {
    expect(accepts('a?', input)).toBe(true);
  });

  it('"a?" rejects "aa"', () => {
    expect(accepts('a?', 'aa')).toBe(false);
  });

  it.each(['ac', 'abc'])('"ab?c" accepts %j', (input) => {
    expect(accepts('ab?c', input)).toBe(true);
  });

  it('"ab?c" rejects "abbc"', () => {
    expect(accepts('ab?c', 'abbc')).toBe(false);
  });
});

describe('regexParser — "+" and "?" combined with existing operators', () => {
  it('"a+(b|c)?d" accepts "ad", "abd", "aad", "aacd" and rejects "d", "abcd"', () => {
    expect(accepts('a+(b|c)?d', 'ad')).toBe(true);
    expect(accepts('a+(b|c)?d', 'abd')).toBe(true);
    expect(accepts('a+(b|c)?d', 'aad')).toBe(true);
    expect(accepts('a+(b|c)?d', 'aacd')).toBe(true);
    expect(accepts('a+(b|c)?d', 'd')).toBe(false);
    expect(accepts('a+(b|c)?d', 'abcd')).toBe(false);
  });
});
