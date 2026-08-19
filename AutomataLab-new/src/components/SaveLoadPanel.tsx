import { useState, useEffect } from 'react';
import { saveAutomaton, listAutomata, loadAutomaton } from '../lib/api';
import { Input, Select } from './ui/Input';
import { Button } from './ui/Button';

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
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      await saveAutomaton(type, saveName, '', currentData);
      setStatus('Saved.');
      setSaveName('');
      await refreshList();
    } catch {
      setStatus('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleLoadSelected(id: string) {
    setSelectedId(id);
    if (!id) return;
    try {
      const record = await loadAutomaton(Number(id));
      onLoad(record.data);
      setStatus(`Loaded "${record.name}"`);
    } catch {
      setStatus('Load failed');
    }
  }

  return (
    <div className="panel">
      <p style={{ fontSize: 11, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px', fontFamily: 'var(--mono)', fontWeight: 600 }}>
        Save / Load
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="Name to save as"
          style={{ flex: 1 }}
        />
        <Button size="sm" onClick={handleSave} loading={saving} disabled={!saveName.trim()}>
          Save
        </Button>
      </div>

      <div style={{ marginTop: 14 }}>
        <p style={{ fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px', fontFamily: 'var(--mono)' }}>
          Load a saved {type.toUpperCase()}
        </p>
        <Select value={selectedId} onChange={(e) => handleLoadSelected(e.target.value)}>
          <option value="">
            {items.length === 0 ? 'Nothing saved yet' : `Select from ${items.length} saved...`}
          </option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
      </div>

      {status && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>{status}</p>}
    </div>
  );
}