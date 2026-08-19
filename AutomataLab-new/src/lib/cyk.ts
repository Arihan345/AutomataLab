import type { CFG } from '../types/cfg';

export type ParseTreeNode = {
  symbol: string;
  children?: ParseTreeNode[];
  production?: string; // e.g. "S -> AB", for the click-to-inspect feature
};

export type CYKCell = { symbols: string[] };

export function cykParse(cfg: CFG, input: string): {
  accepted: boolean;
  tree: ParseTreeNode | null;
  table: CYKCell[][]; // table[len-1][i] = symbols deriving input[i..i+len)
} {
  const n = input.length;
  if (n === 0) return { accepted: false, tree: null, table: [] };

  type CellEntry = { via: 'terminal' } | { via: 'split'; splitPoint: number; left: string; right: string };
  const table: Record<string, CellEntry>[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => ({}))
  );

  for (let i = 0; i < n; i++) {
    const char = input[i];
    cfg.productions.forEach((p) => {
      if (p.right.length === 1 && p.right[0] === char) {
        table[i][0][p.left] = { via: 'terminal' };
      }
    });
  }

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = len - 1;
      for (let split = 1; split < len; split++) {
        const leftCell = table[i][split - 1];
        const rightCell = table[i + split][len - split - 1];
        cfg.productions.forEach((p) => {
          if (p.right.length === 2) {
            const [B, C] = p.right;
            if (leftCell[B] && rightCell[C] && !table[i][j][p.left]) {
              table[i][j][p.left] = { via: 'split', splitPoint: split, left: B, right: C };
            }
          }
        });
      }
    }
  }

  const accepted = !!table[0][n - 1][cfg.startSymbol];
  const tree = accepted ? buildTree(table, input, 0, n - 1, cfg.startSymbol) : null;

  const displayTable: CYKCell[][] = table.map((row) =>
    row.map((cell) => ({ symbols: Object.keys(cell) }))
  );

  return { accepted, tree, table: displayTable };
}

function buildTree(table: Record<string, any>[][], input: string, i: number, j: number, symbol: string): ParseTreeNode {
  const entry = table[i][j][symbol];
  if (entry.via === 'terminal') {
    return { symbol, production: `${symbol} -> ${input[i]}`, children: [{ symbol: input[i] }] };
  }
  const { splitPoint, left, right } = entry;
  const leftTree = buildTree(table, input, i, splitPoint - 1, left);
  const rightTree = buildTree(table, input, i + splitPoint, j - splitPoint, right);
  return { symbol, production: `${symbol} -> ${left}${right}`, children: [leftTree, rightTree] };
}