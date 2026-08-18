import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';

type StateNodeData = {
  label: string;
  isAccept: boolean;
  selfLoops?: string[];
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
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} />
      {data.label}
      <Handle type="source" position={Position.Right} />
      {data.selfLoops && data.selfLoops.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 10,
            color: '#555',
            whiteSpace: 'nowrap',
            background: '#fff',
            padding: '0 4px',
            borderRadius: 4,
            border: '1px solid #ccc',
          }}
        >
          ↺ {data.selfLoops.join(', ')}
        </div>
      )}
    </div>
  );
}