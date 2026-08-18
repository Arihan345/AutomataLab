import { useState, useEffect } from 'react';
import { saveAutomaton, listAutomata, loadAutomaton } from '../lib/api';

type SavedItem = { id: number; name: string; type: string; createdAt: string };

export default function SaveLoadPanel({
  type,
  currentData,
  onLoad,
}: {
  type: string;
  currentData: object;
  onLoad: (data: any) => void;
}) {
  const [saveName, setSaveName] = useState('');
  const [items, setItems] = useState<SavedItem[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  async function refreshList() {
    try {
      const list = await listAutomata();
      setItems(list.filter((i: SavedItem) => i.type === type));
    } catch {
      setStatus('Failed to load saved list');
    }
  }

  useEffect(() => {
    refreshList();
  }, []);

  async function handleSave() {
    if (!saveName.trim()) {
      setStatus('Enter a name first');
      return;
    }
    try {
      await saveAutomaton(type, saveName, '', currentData);
      setStatus('Saved!');
      setSaveName('');
      refreshList();
    } catch {
      setStatus('Save failed');
    }
  }

  async function handleLoad(id: number) {
    try {
      const record = await loadAutomaton(id);
      onLoad(record.data);
      setStatus(`Loaded "${record.name}"`);
    } catch {
      setStatus('Load failed');
    }
  }

  return (
    <div style={{ padding: 10, border: '1px solid #ddd', marginTop: 10 }}>
      <div>
        <input
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="Name to save as"
        />
        <button onClick={handleSave}>Save</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <strong>Saved {type.toUpperCase()}s:</strong>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name}{' '}
              <button onClick={() => handleLoad(item.id)}>Load</button>
            </li>
          ))}
        </ul>
      </div>
      {status && <p style={{ fontSize: 12, color: '#555' }}>{status}</p>}
    </div>
  );
}