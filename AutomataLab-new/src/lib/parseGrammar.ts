import type { CFG, Production } from '../types/cfg';
import { convertToCNF } from './cnfConvert';

function isVariableSymbol(sym: string): boolean {
  return /^[A-Z]$/.test(sym);
}

// Parses "S -> AB | a" style grammar text into a CFG. Rules may be in
// Chomsky Normal Form already, or more general — a right-hand side may have
// any number of symbols and mix terminals with variables (e.g. "S -> aSb"
// or "E -> E+T"); the grammar is automatically converted to CNF (see
// cnfConvert.ts) before being returned, since CYK requires CNF input.
export function parseGrammar(text: string, id: number, name: string, description: string): CFG {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const productions: Production[] = [];
  const variables = new Set<string>();
  const terminals = new Set<string>();
  let startSymbol = '';

  lines.forEach((line, index) => {
    const [leftRaw, rightRaw] = line.split('->');
    if (!leftRaw || !rightRaw) {
      throw new Error(`Malformed line (missing '->'): "${line}"`);
    }

    const left = leftRaw.trim();
    if (index === 0) startSymbol = left;
    variables.add(left);

    const alternatives = rightRaw.split('|').map((alt) => alt.trim());

    alternatives.forEach((alt) => {
      if (alt.length === 0) {
        throw new Error(`Empty alternative in rule for "${left}"`);
      }

      const symbols = alt.split('');
      symbols.forEach((sym) => {
        if (isVariableSymbol(sym)) variables.add(sym);
        else terminals.add(sym);
      });
      productions.push({ left, right: symbols });
    });
  });

  const cfg: CFG = {
    id,
    name,
    description,
    variables: [...variables],
    terminals: [...terminals],
    startSymbol,
    productions,
  };

  return convertToCNF(cfg);
}
