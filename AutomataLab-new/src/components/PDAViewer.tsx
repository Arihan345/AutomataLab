import { useMemo } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StateNode } from './nodes/StateNode';
import pdaToFlow from '../lib/pdaToFlow';
import type { PDA } from '../types/pda';

const nodeTypes = { state: StateNode };

export default function PDAViewer({ pda }: { pda: PDA }) {
  const { nodes, edges } = useMemo(() => pdaToFlow(pda), [pda]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        className="dark-flow"
        fitView
        fitViewOptions={{ padding: 0.4, minZoom: 0.6, maxZoom: 1.3 }}
      >
        <Background color="var(--border)" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}