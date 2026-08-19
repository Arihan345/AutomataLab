import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import { useState } from 'react';

const RADIUS = 33;

export function BackwardEdge({ id, sourceX, sourceY, targetX, targetY, label, style, data }: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const midX = (sourceX + targetX) / 2;
  const laneHeight = (data as any)?.laneHeight ?? 90;

  const startX = sourceX - RADIUS;
  const startY = sourceY;
  const endX = targetX - RADIUS;
  const endY = targetY;

  const apexY = Math.min(startY, endY) - laneHeight;
  const apexXStart = startX - 20;
  const apexXEnd = endX - 20;

  const path = `
    M ${startX} ${startY}
    C ${apexXStart} ${apexY},
      ${apexXEnd} ${apexY},
      ${endX} ${endY}
  `;

  const isActive = (style as any)?.stroke === 'var(--violet)';
  const baseOpacity = (style as any)?.opacity ?? 0.4;
  const displayOpacity = hovered ? 1 : baseOpacity;
  const markerId = `arrow-back-${id}`;

  return (
    <>
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={isActive || hovered ? 'var(--violet)' : 'var(--border-strong)'} />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <BaseEdge
        id={id}
        path={path}
        style={{ ...style, opacity: displayOpacity, strokeWidth: hovered ? 2 : (style as any)?.strokeWidth }}
        markerEnd={`url(#${markerId})`}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${midX}px, ${apexY + laneHeight * 0.15}px)`,
            fontFamily: 'var(--mono)',
            fontSize: hovered ? 12 : 11,
            fontWeight: isActive || hovered ? 700 : 500,
            color: isActive || hovered ? 'var(--violet)' : 'var(--text-2)',
            background: isActive || hovered ? 'var(--violet-soft)' : 'var(--surface-2)',
            opacity: displayOpacity,
            padding: '2px 8px',
            borderRadius: 8,
            border: `1px solid ${isActive || hovered ? 'var(--violet)' : 'var(--border-strong)'}`,
            pointerEvents: 'none',
            transition: 'opacity 0.15s ease, font-size 0.15s ease',
          }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}