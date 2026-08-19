import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';

export function SelfLoopEdge({ id, sourceX, sourceY, targetX, targetY, label, style }: EdgeProps) {
  const loopHeight = 55;

  const path = `
    M ${sourceX} ${sourceY}
    C ${sourceX} ${sourceY - loopHeight},
      ${targetX} ${targetY - loopHeight},
      ${targetX} ${targetY}
  `;

  const apexY = Math.min(sourceY, targetY) - loopHeight;
  const apexX = (sourceX + targetX) / 2;

  const isActive = (style as any)?.stroke === 'var(--violet)';
  const markerId = `arrow-self-${id}`;

  return (
    <>
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={isActive ? 'var(--violet)' : 'var(--border-strong)'} />
        </marker>
      </defs>
      <BaseEdge id={id} path={path} style={style} markerEnd={`url(#${markerId})`} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${apexX}px, ${apexY - 4}px)`,
            fontFamily: 'var(--mono)',
            fontSize: 10.5,
            fontWeight: isActive ? 700 : 500,
            color: isActive ? 'var(--violet)' : 'var(--text-2)',
            background: isActive ? 'var(--violet-soft)' : 'var(--surface-2)',
            padding: '2px 7px',
            borderRadius: 8,
            border: `1px solid ${isActive ? 'var(--violet)' : 'var(--border-strong)'}`,
            pointerEvents: 'none',
          }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}