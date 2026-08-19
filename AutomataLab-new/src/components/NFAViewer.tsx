import { useMemo } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StateNode } from './nodes/StateNode';
import { SelfLoopEdge } from './edges/SelfLoopEdge';
import nfaToFlow from '../lib/nfaToFlow';
import type { NFA } from '../types/automaton';

const nodeTypes = { state: StateNode };
const edgeTypes = { selfLoop: SelfLoopEdge };

export default function NFAViewer({ nfa }: { nfa: NFA }) {
  const { nodes, edges } = useMemo(() => nfaToFlow(nfa), [nfa]);

  // TEMP DEBUG — run once per render, remove after diagnosing
  const testEdge = (edges as any[]).find((e) => e.source === 's0' && e.target === 's1');
  // eslint-disable-next-line no-console
  console.log('🔥 s0 → s1 FINAL:', testEdge);
  // eslint-disable-next-line no-console
  console.log(
    'ALL EDGES FINAL:',
    (edges as any[]).map((e) => ({ id: e.id, source: e.source, target: e.target, label: e.label, dataLabel: e.data?.label, type: e.type }))
  );

  const transitionCount = Object.values(nfa.transitions).reduce(
    (sum, t) => sum + Object.values(t).reduce((s, arr) => s + arr.length, 0),
    0
  );

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 12, left: 16, right: 16, zIndex: 5, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.06em' }}>NFA GRAPH</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)' }}>
          {nfa.states.length} states · {transitionCount} transitions
        </span>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        className="dark-flow"
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultViewport={{ x: 0, y: 40, zoom: 1 }}
      >
        <Background color="var(--border)" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}