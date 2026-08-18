import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useEdges,
} from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export default function MultiEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  markerEnd,
  markerStart,
  style = {},
}: EdgeProps) {
  const edges = useEdges();

  // Find all edges between this source-target pair (in both directions)
  const parallelEdges = edges.filter(
    (edge) =>
      (edge.source === sourceX.toString() && edge.target === targetX.toString()) ||
      (edge.source === targetX.toString() && edge.target === sourceX.toString())
  );

  // Get the index of the current edge among parallel edges
  const edgeIndex = parallelEdges.findIndex((edge) => edge.id === id);
  const edgeCount = parallelEdges.length;

  // Calculate offset based on edge position in the parallel group
  // Spread edges across different curve amplitudes
  const offset = edgeCount > 1 ? ((edgeIndex - (edgeCount - 1) / 2) * 40) : 0;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    curvature: 0.25 + Math.abs(offset) * 0.01, // Increase curvature based on offset
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          ...style,
          strokeWidth: 2,
        }}
      />
      <EdgeLabelRenderer>
        {label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX + offset * 0.3}px, ${labelY}px)`,
              fontSize: 12,
              fontWeight: 500,
              pointerEvents: 'none',
              backgroundColor: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
