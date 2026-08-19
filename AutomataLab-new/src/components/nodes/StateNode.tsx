import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';

type StateNodeData = { label: string; isAccept: boolean; isStart?: boolean; isCurrent?: boolean };
type StateNodeType = Node<StateNodeData, 'state'>;

export function StateNode({ data }: NodeProps<StateNodeType>) {
  return (
    <div style={{ position: 'relative' }}>
      {data.isStart && (
        <svg width="42" height="20" style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)' }}>
          <line x1="0" y1="10" x2="30" y2="10" stroke="var(--text-1)" strokeWidth="2" />
          <polygon points="30,3 42,10 30,17" fill="var(--text-1)" />
        </svg>
      )}
      <div
        style={{
          width: 66, height: 66, borderRadius: '50%',
          border: data.isAccept ? '2.5px solid var(--teal)' : '1.5px solid var(--violet)',
          boxShadow: data.isCurrent
            ? '0 0 0 3px var(--violet-soft)'
            : data.isAccept ? '0 0 8px rgba(45,212,191,0.18)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: data.isCurrent ? 'var(--violet-soft)' : 'var(--surface)',
          color: data.isAccept ? 'var(--teal)' : 'var(--text-1)',
          fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 600,
          outline: data.isAccept ? '1px solid var(--teal)' : 'none',
          outlineOffset: 3,
          transition: 'box-shadow 0.2s ease, background 0.2s ease',
        }}
      >
        <Handle type="target" position={Position.Left} style={{ background: 'var(--border-strong)', border: 'none' }} />
        {data.label}
        <Handle type="source" position={Position.Right} style={{ background: 'var(--border-strong)', border: 'none' }} />
        <Handle id="loop-source" type="source" position={Position.Top} style={{ left: '30%', opacity: 0 }} />
        <Handle id="loop-target" type="target" position={Position.Top} style={{ left: '70%', opacity: 0 }} />
      </div>
    </div>
  );
}