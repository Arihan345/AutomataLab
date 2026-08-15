export const EPSILON = 'ε';

export interface DFA{
    id: number,
    name: string,
    description: string,
    states: string[],
    alphabet: string[],
    transitions: { [key: string]: { [key: string]: string } },
    startState: string,
    acceptStates: string[]  
}

export interface NFA{
    id: number,
    name: string,
    description: string,
    states: string[],
    alphabet: string[],
    // transitions[state][symbol] = [possible next states]
    // symbol can be any alphabet character or EPSILON for epsilon-transitions
    transitions: { [key: string]: { [key: string]: string[] } },
    startState: string,
    acceptStates: string[]
}