import type { CFG, Production } from '../types/cfg';

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

      if (alt.length === 1 && alt === alt.toLowerCase()) {
        // single terminal
        terminals.add(alt);
        productions.push({ left, right: [alt] });
      } else if (alt.length === 2) {
        // two variables (CNF requirement)
        variables.add(alt[0]);
        variables.add(alt[1]);
        productions.push({ left, right: [alt[0], alt[1]] });
      } else {
        throw new Error(
          `Rule "${left} -> ${alt}" is not in Chomsky Normal Form (must be exactly 2 variables or 1 terminal)`
        );
      }
    });
  });

  return {
    id,
    name,
    description,
    variables: [...variables],
    terminals: [...terminals],
    startSymbol,
    productions,
  };
}