import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StateNode } from './nodes/StateNode';
import type { PDA } from '../types/pda';
import pdaToFlow from '../lib/pdaToFlow';

const nodeTypes = { state: StateNode };

export default function PDAViewer({ pda }: { pda: PDA }) {
  const { nodes, edges } = pdaToFlow(pda);
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}