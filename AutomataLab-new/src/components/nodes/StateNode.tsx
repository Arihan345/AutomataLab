import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';

type StateNodeData = { label: string; isAccept: boolean; isStart?: boolean; isCurrent?: boolean };
type StateNodeType = Node<StateNodeData, 'state'>;

export function StateNode({ data }: NodeProps<StateNodeType>) {
  return (
    <div style={{ position: 'relative' }}>
      {data.isStart && (
        <svg width="36" height="18" style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)' }}>
          <line x1="0" y1="9" x2="27" y2="9" stroke="var(--text-2)" strokeWidth="1.5" />
          <polygon points="27,3 36,9 27,15" fill="var(--text-2)" />
        </svg>
      )}
      <div
        style={{
          width: 66, height: 66, borderRadius: '50%',
          border: data.isAccept ? '2.5px solid var(--teal)' : '1.5px solid var(--violet)',
          boxShadow: data.isCurrent
            ? '0 0 0 5px var(--violet-soft), 0 0 20px rgba(139,124,246,0.55)'
            : data.isAccept ? '0 0 10px rgba(45,212,191,0.2)' : 'none',
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

        {/* dedicated, invisible handles for self-loop edges only */}
        <Handle id="loop-source" type="source" position={Position.Top} style={{ left: '30%', opacity: 0 }} />
        <Handle id="loop-target" type="target" position={Position.Top} style={{ left: '70%', opacity: 0 }} />
      </div>
    </div>
  );
}