import { describe, it, expect } from 'vitest';
import { parseGrammar } from './parseGrammar';
import { cykParse } from './cyk';

describe('parseGrammar — accepts already-CNF input unchanged', () => {
  it('parses "S -> AB | a" style CNF grammars as before', () => {
    const cfg = parseGrammar('S -> AB | a\nA -> a\nB -> b', 1, 'g', '');
    expect(cykParse(cfg, 'ab').accepted).toBe(true);
    expect(cykParse(cfg, 'a').accepted).toBe(true);
    expect(cykParse(cfg, 'ba').accepted).toBe(false);
  });
});

describe('parseGrammar — auto-converts general (non-CNF) grammars to CNF', () => {
  it('handles a right-hand side longer than 2 symbols, mixed with terminals (a^n b^n)', () => {
    // S -> aSb | ab is not CNF: both alternatives exceed 2 symbols or mix
    // terminals into a rule that also has a variable.
    const cfg = parseGrammar('S -> aSb | ab', 1, 'anbn', '');

    // every production must now be in CNF
    for (const p of cfg.productions) {
      const isTerminalRule = p.right.length === 1 && cfg.terminals.includes(p.right[0]);
      const isBinaryVarRule = p.right.length === 2 && p.right.every((s) => !cfg.terminals.includes(s));
      expect(isTerminalRule || isBinaryVarRule).toBe(true);
    }

    expect(cykParse(cfg, 'ab').accepted).toBe(true);
    expect(cykParse(cfg, 'aabb').accepted).toBe(true);
    expect(cykParse(cfg, 'aaabbb').accepted).toBe(true);
    expect(cykParse(cfg, 'abb').accepted).toBe(false);
    expect(cykParse(cfg, 'a').accepted).toBe(false);
    expect(cykParse(cfg, 'aabbb').accepted).toBe(false);
  });

  it('handles a 3-symbol all-variable rule alongside CNF rules', () => {
    // S -> ABC | a, A -> a, B -> b, C -> c  =>  accepts "a" or "abc"
    const cfg = parseGrammar('S -> ABC | a\nA -> a\nB -> b\nC -> c', 1, 'abc', '');
    expect(cykParse(cfg, 'abc').accepted).toBe(true);
    expect(cykParse(cfg, 'a').accepted).toBe(true);
    expect(cykParse(cfg, 'ab').accepted).toBe(false);
  });
});
