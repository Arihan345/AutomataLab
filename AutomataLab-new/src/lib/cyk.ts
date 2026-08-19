import type { CFG } from '../types/cfg';

export type ParseTreeNode = {
  symbol: string;
  children?: ParseTreeNode[];
};

export function cykParse(cfg: CFG, input: string): { accepted: boolean; tree: ParseTreeNode | null } {
  const n = input.length;
  if (n === 0) return { accepted: false, tree: null };

  // table[i][j] = set of variables that derive substring starting at i, length j+1
  // we store, for each cell, a map: variable -> how it was derived (for tree reconstruction)
  type CellEntry = { via: 'terminal' } | { via: 'split'; splitPoint: number; left: string; right: string };
  const table: Record<string, CellEntry>[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => ({}))
  );

  // base case: substrings of length 1
  for (let i = 0; i < n; i++) {
    const char = input[i];
    cfg.productions.forEach((p) => {
      if (p.right.length === 1 && p.right[0] === char) {
        table[i][0][p.left] = { via: 'terminal' };
      }
    });
  }

  // fill in increasing substring length
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = len - 1; // column index for this length
      for (let split = 1; split < len; split++) {
        const leftCell = table[i][split - 1];
        const rightCell = table[i + split][len - split - 1];

        cfg.productions.forEach((p) => {
          if (p.right.length === 2) {
            const [B, C] = p.right;
            if (leftCell[B] && rightCell[C]) {
              if (!table[i][j][p.left]) {
                table[i][j][p.left] = { via: 'split', splitPoint: split, left: B, right: C };
              }
            }
          }
        });
      }
    }
  }

  const accepted = !!table[0][n - 1][cfg.startSymbol];
  const tree = accepted ? buildTree(table, input, 0, n - 1, cfg.startSymbol) : null;

  return { accepted, tree };
}

function buildTree(
  table: Record<string, any>[][],
  input: string,
  i: number,
  j: number,
  symbol: string
): ParseTreeNode {
  const entry = table[i][j][symbol];
  if (entry.via === 'terminal') {
    return { symbol, children: [{ symbol: input[i] }] };
  }
  const { splitPoint, left, right } = entry;
  const leftTree = buildTree(table, input, i, splitPoint - 1, left);
  const rightTree = buildTree(table, input, i + splitPoint, j - splitPoint, right);
  return { symbol, children: [leftTree, rightTree] };
}