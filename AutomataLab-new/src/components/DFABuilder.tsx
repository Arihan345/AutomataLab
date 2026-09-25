import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MarkerType,
  useReactFlow,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StateNode } from './nodes/StateNode';
import { SelfLoopEdge } from './edges/SelfLoopEdge';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import type { DFA } from '../types/automaton';

const nodeTypes = { state: StateNode };
const edgeTypes = { selfLoop: SelfLoopEdge };

type Positions = Record<string, { x: number; y: number }>;

function nextStateName(states: string[]): string {
  let max = -1;
  states.forEach((s) => {
    const m = /^q(\d+)$/.exec(s);
    if (m) max = Math.max(max, Number(m[1]));
  });
  return `q${max + 1}`;
}

function deriveAlphabet(transitions: DFA['transitions']): string[] {
  const set = new Set<string>();
  Object.values(transitions).forEach((row) => Object.keys(row).forEach((s) => set.add(s)));
  return [...set];
}

function gridPosition(index: number): { x: number; y: number } {
  return { x: (index % 5) * 170 + 60, y: Math.floor(index / 5) * 170 + 60 };
}

type PendingConnection = { source: string; target: string };
type MenuState = { id: string; x: number; y: number };

function DFABuilderInner({ dfa, onChange }: { dfa: DFA; onChange: (next: DFA) => void }) {
  const { screenToFlowPosition } = useReactFlow();
  const [positions, setPositions] = useState<Positions>(() => {
    const p: Positions = {};
    dfa.states.forEach((s, i) => { p[s] = gridPosition(i); });
    return p;
  });
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingConnection | null>(null);
  const [symbolDraft, setSymbolDraft] = useState('');

  useEffect(() => {
    setPositions((prev) => {
      let changed = false;
      const next = { ...prev };
      dfa.states.forEach((s, i) => {
        if (!next[s]) { next[s] = gridPosition(i); changed = true; }
      });
      return changed ? next : prev;
    });
  }, [dfa.states]);

  function update(mutate: (draft: DFA) => DFA) {
    onChange(mutate(dfa));
  }

  const addState = useCallback((x: number, y: number) => {
    const name = nextStateName(dfa.states);
    setPositions((prev) => ({ ...prev, [name]: { x, y } }));
    update((d) => ({
      ...d,
      states: [...d.states, name],
      startState: d.startState || name,
    }));
  }, [dfa]);

  const toggleStart = useCallback((id: string) => {
    update((d) => ({ ...d, startState: d.startState === id ? '' : id }));
  }, [dfa]);

  const toggleAccept = useCallback((id: string) => {
    update((d) => ({
      ...d,
      acceptStates: d.acceptStates.includes(id)
        ? d.acceptStates.filter((s) => s !== id)
        : [...d.acceptStates, id],
    }));
  }, [dfa]);

  const deleteState = useCallback((id: string) => {
    update((d) => {
      const transitions: DFA['transitions'] = {};
      Object.entries(d.transitions).forEach(([from, row]) => {
        if (from === id) return;
        const nextRow: Record<string, string> = {};
        Object.entries(row).forEach(([symbol, to]) => {
          if (to !== id) nextRow[symbol] = to;
        });
        transitions[from] = nextRow;
      });
      return {
        ...d,
        states: d.states.filter((s) => s !== id),
        acceptStates: d.acceptStates.filter((s) => s !== id),
        startState: d.startState === id ? '' : d.startState,
        transitions,
        alphabet: deriveAlphabet(transitions),
      };
    });
    setMenu(null);
  }, [dfa]);

  const beginConnect = useCallback((id: string) => {
    setConnectFrom(id);
    setMenu(null);
  }, []);

  function openSymbolPrompt(source: string, target: string) {
    setPending({ source, target });
    setSymbolDraft('');
    setConnectFrom(null);
  }

  function commitTransition() {
    if (!pending || !symbolDraft.trim()) return;
    const symbol = symbolDraft.trim();
    update((d) => {
      const transitions = {
        ...d.transitions,
        [pending.source]: { ...d.transitions[pending.source], [symbol]: pending.target },
      };
      return { ...d, transitions, alphabet: deriveAlphabet(transitions) };
    });
    setPending(null);
    setSymbolDraft('');
  }

  const onConnect = useCallback((connection: Connection) => {
    openSymbolPrompt(connection.source, connection.target);
  }, [dfa]);

  function onPaneClick(event: React.MouseEvent) {
    if (connectFrom) { setConnectFrom(null); return; }
    if (menu) { setMenu(null); return; }
    const { x, y } = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    addState(x, y);
  }

  function onNodeClick(event: React.MouseEvent, node: Node) {
    event.stopPropagation();
    if (connectFrom) {
      openSymbolPrompt(connectFrom, node.id);
      return;
    }
    setMenu({ id: node.id, x: event.clientX, y: event.clientY });
  }

  function onEdgeClick(event: React.MouseEvent, edge: Edge) {
    event.stopPropagation();
    const { from, symbol } = edge.data as { from: string; symbol: string };
    update((d) => {
      const row = { ...d.transitions[from] };
      delete row[symbol];
      const transitions = { ...d.transitions, [from]: row };
      return { ...d, transitions, alphabet: deriveAlphabet(transitions) };
    });
  }

  const nodes: Node[] = dfa.states.map((s) => ({
    id: s,
    type: 'state',
    position: positions[s] ?? gridPosition(0),
    data: {
      label: s,
      isAccept: dfa.acceptStates.includes(s),
      isStart: s === dfa.startState,
      isCurrent: s === connectFrom,
    },
  }));

  const edges: Edge[] = [];
  Object.entries(dfa.transitions).forEach(([from, row]) => {
    Object.entries(row).forEach(([symbol, to]) => {
      const isSelfLoop = to === from;
      edges.push({
        id: `${from}-${symbol}-${to}`,
        source: from,
        target: to,
        sourceHandle: isSelfLoop ? 'loop-source' : undefined,
        targetHandle: isSelfLoop ? 'loop-target' : undefined,
        type: isSelfLoop ? 'selfLoop' : 'default',
        label: symbol,
        data: { from, symbol, to },
        markerEnd: isSelfLoop ? undefined : { type: MarkerType.ArrowClosed, color: 'var(--border-strong)' },
        style: { stroke: 'var(--border-strong)', strokeWidth: 1.4 },
        labelStyle: { fill: 'var(--text-1)', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700 },
        labelBgStyle: { fill: 'var(--surface-2)' },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 10,
      });
    });
  });

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 12, left: 16, right: 16, zIndex: 5, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
          BUILD MODE — click empty space to add a state, click a state for options
        </span>
        {connectFrom && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--violet)' }}>
            Adding transition from {connectFrom} — click a target state (Esc/click empty space to cancel)
          </span>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        className="dark-flow"
        fitView
        fitViewOptions={{ padding: 0.3 }}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        onNodeDragStop={(_, node) => setPositions((prev) => ({ ...prev, [node.id]: node.position }))}
      >
        <Background color="var(--border)" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {menu && (
        <div
          style={{
            position: 'fixed', left: menu.x + 8, top: menu.y + 8, zIndex: 30,
            background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 8,
            boxShadow: 'var(--shadow-md)', padding: 8, width: 190,
          }}
        >
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', margin: '2px 6px 8px', letterSpacing: '0.05em' }}>
            STATE {menu.id}
          </p>
          <MenuButton onClick={() => toggleStart(menu.id)}>
            {dfa.startState === menu.id ? '✓ ' : ''}Start state
          </MenuButton>
          <MenuButton onClick={() => toggleAccept(menu.id)}>
            {dfa.acceptStates.includes(menu.id) ? '✓ ' : ''}Accept state
          </MenuButton>
          <MenuButton onClick={() => beginConnect(menu.id)}>Add transition →</MenuButton>
          <MenuButton onClick={() => deleteState(menu.id)} danger>Delete state</MenuButton>
        </div>
      )}

      {pending && (
        <div
          style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 30,
            background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 8,
            boxShadow: 'var(--shadow-md)', padding: 12, display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--text-2)' }}>
            {pending.source} → {pending.target} on
          </span>
          <Input
            autoFocus
            value={symbolDraft}
            onChange={(e) => setSymbolDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitTransition(); if (e.key === 'Escape') setPending(null); }}
            placeholder="symbol"
            style={{ width: 70 }}
          />
          <Button size="sm" onClick={commitTransition} disabled={!symbolDraft.trim()}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setPending(null)}>Cancel</Button>
        </div>
      )}
    </div>
  );
}

function MenuButton({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
        borderRadius: 5, color: danger ? 'var(--rose)' : 'var(--text-1)', fontFamily: 'var(--mono)', fontSize: 12.5,
        padding: '7px 8px', cursor: 'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

export default function DFABuilder({ dfa, onChange }: { dfa: DFA; onChange: (next: DFA) => void }) {
  return (
    <ReactFlowProvider>
      <DFABuilderInner dfa={dfa} onChange={onChange} />
    </ReactFlowProvider>
  );
}
