import { useMemo } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StateNode } from './nodes/StateNode';
import MultiEdge from './edges/MultiEdge';
import type { NFA } from '../types/automaton';
import nfaToFlow from '../lib/nfaToFlow';

const nodeTypes = { state: StateNode };
const edgeTypes = { multiEdge: MultiEdge };

export default function NFAViewer({ nfa }: { nfa: NFA }) {
  const { nodes, edges } = useMemo(() => nfaToFlow(nfa), [nfa]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}