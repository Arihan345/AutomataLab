import type { RegexNode } from '../types/regex';

export class ParserState {
  input: string;
  pos: number;

  constructor(input: string, pos: number = 0) {
    this.input = input;
    this.pos = pos;
  }

  peek(): string | undefined {
    return this.input[this.pos];
  }

  advance(): string {
    return this.input[this.pos++];
  }
}

export function parseAtom(state: ParserState): RegexNode {
  if (state.peek() === '(') {
    state.advance(); 
    const node = parseUnion(state);
    if (state.peek() !== ')') {
      throw new Error(`Expected ')' at position ${state.pos}`);
    }
    state.advance();
    return node;
  }

  const char = state.advance();
  return { type: 'symbol', value: char };
}
export function parseStar(state: ParserState): RegexNode {
  const node = parseAtom(state);
  if (state.peek() === '*') {
    state.advance();
    return { type: 'star', child: node };
  }
  return node;
}
export function parseConcat(state: ParserState): RegexNode {
    let left=parseStar(state);
    while (state.peek() && state.peek() !== '|' && state.peek() !== ')') {
        const right = parseStar(state);
        left = { type: 'concat', left, right };
    }
    return left;
}
export function parseUnion(state:ParserState): RegexNode {
    let left=parseConcat(state);
    while (state.peek() === '|') {
        state.advance();
        const right = parseConcat(state);
        left = { type: 'union', left, right };
    }
    return left;
}