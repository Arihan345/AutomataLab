const API_URL = 'http://localhost:4000';

export async function saveAutomaton(type: string, name: string, description: string, data: object) {
  const res = await fetch(`${API_URL}/automata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, name, description, data }),
  });
  if (!res.ok) throw new Error('Failed to save automaton');
  return res.json();
}

export async function listAutomata() {
  const res = await fetch(`${API_URL}/automata`);
  if (!res.ok) throw new Error('Failed to list automata');
  return res.json();
}

export async function loadAutomaton(id: number) {
  const res = await fetch(`${API_URL}/automata/${id}`);
  if (!res.ok) throw new Error('Failed to load automaton');
  return res.json();
}