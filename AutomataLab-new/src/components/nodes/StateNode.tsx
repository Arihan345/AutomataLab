import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';

type StateNodeData = {
  label: string;
  isAccept: boolean;
};

type StateNodeType = Node<StateNodeData, 'state'>;

export function StateNode({ data }: NodeProps<StateNodeType>) {
  return (
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        border: data.isAccept ? '3px double #333' : '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
      }}
    >
      <Handle type="target" position={Position.Left} />
      {data.label}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}