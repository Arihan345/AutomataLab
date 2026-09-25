import { describe, it, expect } from 'vitest';
import { cykParse } from './cyk';
import type { CFG } from '../types/cfg';

// S -> AB | a, A -> a, B -> b  (already in CNF)
const cfg: CFG = {
  id: 1,
  name: 'ab-grammar',
  description: '',
  variables: ['S', 'A', 'B'],
  terminals: ['a', 'b'],
  startSymbol: 'S',
  productions: [
    { left: 'S', right: ['A', 'B'] },
    { left: 'S', right: ['a'] },
    { left: 'A', right: ['a'] },
    { left: 'B', right: ['b'] },
  ],
};

describe('cykParse', () => {
  it('accepts "ab" via S -> AB, with the expected parse tree shape', () => {
    const { accepted, tree } = cykParse(cfg, 'ab');
    expect(accepted).toBe(true);
    expect(tree).toEqual({
      symbol: 'S',
      production: 'S -> AB',
      children: [
        { symbol: 'A', production: 'A -> a', children: [{ symbol: 'a' }] },
        { symbol: 'B', production: 'B -> b', children: [{ symbol: 'b' }] },
      ],
    });
  });

  it('accepts "a" directly via S -> a', () => {
    const { accepted, tree } = cykParse(cfg, 'a');
    expect(accepted).toBe(true);
    expect(tree).toEqual({ symbol: 'S', production: 'S -> a', children: [{ symbol: 'a' }] });
  });

  it('rejects a string not derivable from the grammar', () => {
    const { accepted, tree } = cykParse(cfg, 'ba');
    expect(accepted).toBe(false);
    expect(tree).toBeNull();
  });

  it('rejects the empty string (no epsilon production)', () => {
    const { accepted, tree, table } = cykParse(cfg, '');
    expect(accepted).toBe(false);
    expect(tree).toBeNull();
    expect(table).toEqual([]);
  });
});
