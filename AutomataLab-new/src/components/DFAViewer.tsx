import { useMemo } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StateNode } from './nodes/StateNode';
import { SelfLoopEdge } from './edges/SelfLoopEdge';
import { BackwardEdge } from './edges/BackwardEdge';
import dfatoFlow from '../lib/dfaToFlow';
import type { DFA } from '../types/automaton';

const nodeTypes = { state: StateNode };
const edgeTypes = { selfLoop: SelfLoopEdge, backward: BackwardEdge };

export default function DFAViewer({
  dfa,
  currentState,
  activeTransition,
  onStateClick,
}: {
  dfa: DFA;
  currentState?: string;
  activeTransition?: { from: string; symbol: string };
  onStateClick?: (id: string) => void;
}) {
  const { nodes, edges } = useMemo(
    () => dfatoFlow(dfa, currentState, activeTransition),
    [dfa, currentState, activeTransition]
  );
  const transitionCount = Object.values(dfa.transitions).reduce((sum, t) => sum + Object.keys(t).length, 0);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 12, left: 16, right: 16, zIndex: 5, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.06em' }}>AUTOMATON GRAPH</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)' }}>
          {dfa.states.length} states · {transitionCount} transitions
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
        onNodeClick={(_, node) => onStateClick?.(node.id)}
      >
        <Background color="var(--border)" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}