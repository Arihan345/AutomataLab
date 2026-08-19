export type Production = {
  left: string; // e.g. "S"
  right: string[]; // e.g. ["A", "B"] for "S -> AB", or ["a"] for "S -> a"
};

export type CFG = {
  id: number;
  name: string;
  description: string;
  variables: string[]; // non-terminals, e.g. ["S", "A", "B"]
  terminals: string[]; // e.g. ["a", "b"]
  startSymbol: string;
  productions: Production[];
};