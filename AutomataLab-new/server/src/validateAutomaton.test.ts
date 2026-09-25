import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateAutomatonData } from './validateAutomaton.js';

const validDfa = {
  states: ['q0', 'q1'],
  startState: 'q0',
  transitions: { q0: { a: 'q1', b: 'q0' }, q1: { a: 'q1', b: 'q1' } },
};

test('accepts a well-formed DFA', () => {
  const result = validateAutomatonData('dfa', validDfa);
  assert.equal(result.valid, true);
});

test('rejects a startState that is not in states', () => {
  const result = validateAutomatonData('dfa', { ...validDfa, startState: 'q9' });
  assert.equal(result.valid, false);
  if (!result.valid) assert.match(result.error, /startState/);
});

test('rejects a missing/non-array states field', () => {
  const result = validateAutomatonData('dfa', { startState: 'q0', transitions: {} });
  assert.equal(result.valid, false);
  if (!result.valid) assert.match(result.error, /states/);
});

test('rejects a transition target that references an unknown state', () => {
  const result = validateAutomatonData('dfa', {
    states: ['q0', 'q1'],
    startState: 'q0',
    transitions: { q0: { a: 'q9' } }, // q9 doesn't exist
  });
  assert.equal(result.valid, false);
  if (!result.valid) assert.match(result.error, /unknown state/);
});

test('accepts a PDA-shaped transitions object (nested, newState-tagged results)', () => {
  const result = validateAutomatonData('pda', {
    states: ['q0', 'qf'],
    startState: 'q0',
    transitions: {
      q0: { '(': { Z: [{ newState: 'q0', push: ['X', 'Z'] }] } },
    },
  });
  assert.equal(result.valid, true);
});

test('rejects a PDA transition whose newState is unknown', () => {
  const result = validateAutomatonData('pda', {
    states: ['q0'],
    startState: 'q0',
    transitions: {
      q0: { '(': { Z: [{ newState: 'qGhost', push: ['Z'] }] } },
    },
  });
  assert.equal(result.valid, false);
});

test('skips states/startState checks for CFG data (different shape entirely)', () => {
  const result = validateAutomatonData('cfg', {
    variables: ['S'],
    terminals: ['a'],
    startSymbol: 'S',
    productions: [{ left: 'S', right: ['a'] }],
  });
  assert.equal(result.valid, true);
});
