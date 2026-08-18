import type { RegexNode } from '../types/regex';
import type { NFA } from '../types/automaton';
import { EPSILON } from '../types/automaton';

let stateCounter = 0;
function newState(): string {
  return `s${stateCounter++}`;
}

export type NFAFragment={
    start:string,
    accept:string,
    states:string[],
    transitions:Record<string,Record<string,string[]>>
}
export function addTransition(
    transitions:Record<string,Record<string,string[]>>,
    from:string,
    symbol:string,
    to:string
){
    if (!transitions[from]) transitions[from] = {};
  if (!transitions[from][symbol]) transitions[from][symbol] = [];
  transitions[from][symbol].push(to);
}
export function buildSymbolFragment(symbol: string): NFAFragment {
  const start = newState();
  const accept = newState();
  const transitions: Record<string, Record<string, string[]>> = {};
  addTransition(transitions, start, symbol, accept);

  return {
    start,
    accept,
    states: [start, accept],
    transitions,
  };
}
export function buildConcatFragment(left: NFAFragment, right: NFAFragment): NFAFragment {
    const transitions: Record<string, Record<string, string[]>> = {
        ...left.transitions,
        ...right.transitions,
    };
    addTransition(transitions, left.accept, EPSILON, right.start);

    return {
        start: left.start,
        accept: right.accept,
        states: [...left.states, ...right.states],
        transitions,
    };
}
export function buildUnionFragment(left: NFAFragment, right: NFAFragment): NFAFragment {
    const start = newState();
    const accept = newState();
    const transitions: Record<string, Record<string, string[]>> = {
        ...left.transitions,
        ...right.transitions,
    };
    addTransition(transitions, start, EPSILON, left.start);
    addTransition(transitions, start, EPSILON, right.start);
    addTransition(transitions, left.accept, EPSILON, accept);
    addTransition(transitions, right.accept, EPSILON, accept);

    return {
        start,
        accept,
        states: [start, accept, ...left.states, ...right.states],
        transitions,
    };
}
export function buildStarFragment(child: NFAFragment): NFAFragment {
    const start = newState();
    const accept = newState();
    const transitions: Record<string, Record<string, string[]>> = {
        ...child.transitions,
    };
    addTransition(transitions, start, EPSILON, child.start);
    addTransition(transitions, start, EPSILON, accept);
    addTransition(transitions, child.accept, EPSILON, child.start);
    addTransition(transitions, child.accept, EPSILON, accept);

    return {
        start,
        accept,
        states: [start, accept, ...child.states],
        transitions,
    };
}   

export function buildNFAFromRegexNode(node: RegexNode): NFAFragment {
    switch (node.type) {
        case 'symbol':
            return buildSymbolFragment(node.value);
        case 'concat':
            const leftConcat = buildNFAFromRegexNode(node.left);
            const rightConcat = buildNFAFromRegexNode(node.right);
            return buildConcatFragment(leftConcat, rightConcat);
        case 'union':
            const leftUnion = buildNFAFromRegexNode(node.left);
            const rightUnion = buildNFAFromRegexNode(node.right);
            return buildUnionFragment(leftUnion, rightUnion);
        case 'star':
            const childStar = buildNFAFromRegexNode(node.child);
            return buildStarFragment(childStar);
        default:
            throw new Error(`Unknown node type: ${(node as any).type}`);
    }
}
export function fragmenttoNFA(fragment: NFAFragment, id: number, name: string, description: string): NFA {
    return {
        id,
        name,
        description,
        states: fragment.states,
        alphabet: Object.keys(fragment.transitions).reduce((acc, state) => {
            const symbols = Object.keys(fragment.transitions[state]).filter(s => s !== EPSILON);
            return [...new Set([...acc, ...symbols])];
        }, [] as string[]),
        transitions: fragment.transitions,
        startState: fragment.start,
        acceptStates: [fragment.accept],
    };
}