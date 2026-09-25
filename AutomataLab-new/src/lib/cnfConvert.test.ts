import { describe, it, expect } from 'vitest';
import { convertToCNF } from './cnfConvert';
import type { CFG } from '../types/cfg';

function cfg(partial: Partial<CFG> & Pick<CFG, 'variables' | 'terminals' | 'productions' | 'startSymbol'>): CFG {
  return { id: 1, name: 'g', description: '', ...partial };
}

describe('convertToCNF', () => {
  it('leaves an already-CNF grammar unchanged', () => {
    const g = cfg({
      variables: ['S', 'A', 'B'],
      terminals: ['a', 'b'],
      startSymbol: 'S',
      productions: [
        { left: 'S', right: ['A', 'B'] },
        { left: 'S', right: ['a'] },
        { left: 'A', right: ['a'] },
        { left: 'B', right: ['b'] },
      ],
    });
    const out = convertToCNF(g);
    expect(out.productions).toEqual(g.productions);
    expect(out.variables).toEqual(g.variables);
  });

  it('binarizes a right-hand side longer than 2 (all variables)', () => {
    const g = cfg({
      variables: ['A', 'B', 'C', 'D'],
      terminals: [],
      startSymbol: 'A',
      productions: [{ left: 'A', right: ['B', 'C', 'D'] }],
    });
    const out = convertToCNF(g);
    // A -> B X0, X0 -> C D
    expect(out.productions).toHaveLength(2);
    expect(out.productions.every((p) => p.right.length === 2)).toBe(true);
    const first = out.productions.find((p) => p.left === 'A')!;
    const chainVar = first.right[1];
    expect(first.right[0]).toBe('B');
    const second = out.productions.find((p) => p.left === chainVar)!;
    expect(second.right).toEqual(['C', 'D']);
  });

  it('wraps a terminal that shares a rule with another symbol', () => {
    const g = cfg({
      variables: ['A', 'B'],
      terminals: ['a'],
      startSymbol: 'A',
      productions: [{ left: 'A', right: ['a', 'B'] }],
    });
    const out = convertToCNF(g);
    // A -> T B, T -> a
    const rule = out.productions.find((p) => p.left === 'A')!;
    expect(rule.right).toHaveLength(2);
    const wrapperVar = rule.right[0];
    expect(rule.right[1]).toBe('B');
    const wrapperRule = out.productions.find((p) => p.left === wrapperVar)!;
    expect(wrapperRule.right).toEqual(['a']);
  });

  it('reuses the same wrapper variable for repeated terminals', () => {
    const g = cfg({
      variables: ['S'],
      terminals: ['a', 'b'],
      startSymbol: 'S',
      productions: [
        { left: 'S', right: ['a', 'S', 'b'] },
        { left: 'S', right: ['a', 'b'] },
      ],
    });
    const out = convertToCNF(g);
    const terminalRules = out.productions.filter((p) => p.right.length === 1);
    // exactly one wrapper production per distinct terminal, reused everywhere
    expect(terminalRules).toHaveLength(2);
    expect(new Set(terminalRules.map((p) => p.right[0]))).toEqual(new Set(['a', 'b']));
  });

  it('every resulting production is in CNF (A -> a or A -> BC)', () => {
    const g = cfg({
      variables: ['S'],
      terminals: ['a', 'b', 'c'],
      startSymbol: 'S',
      productions: [{ left: 'S', right: ['a', 'b', 'c', 'S'] }],
    });
    const out = convertToCNF(g);
    for (const p of out.productions) {
      const isTerminalRule = p.right.length === 1 && out.terminals.includes(p.right[0]);
      const isBinaryVarRule = p.right.length === 2 && p.right.every((s) => !out.terminals.includes(s));
      expect(isTerminalRule || isBinaryVarRule).toBe(true);
    }
  });
});
