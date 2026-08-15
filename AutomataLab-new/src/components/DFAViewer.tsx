import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StateNode } from './nodes/StateNode';
import dfatoFlow from '../lib/dfaToFlow';
import type { DFA } from '../types/automaton';

const nodeTypes = { state: StateNode };

export default function DFAViewer({ dfa }: { dfa: DFA }) {
  const { nodes, edges } = dfatoFlow(dfa);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}