import { useMemo } from 'react';
import { bfsLayout } from '../../lib/bfsLayout';
import type { DFA } from '../../types/automaton';

const RADIUS = 33;

function StateCircle({
  id, x, y, isAccept, isStart, isCurrent, onClick,
}: { id: string; x: number; y: number; isAccept: boolean; isStart: boolean; isCurrent: boolean; onClick?: () => void }) {
  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {isStart && (
        <>
          <line x1={-RADIUS - 30} y1={0} x2={-RADIUS - 4} y2={0} stroke="var(--text-1)" strokeWidth={2} />
          <polygon points={`${-RADIUS - 4},-6 ${-RADIUS + 6},0 ${-RADIUS - 4},6`} fill="var(--text-1)" />
        </>
      )}
      <circle
        r={RADIUS}
        fill={isCurrent ? 'var(--violet-soft)' : 'var(--surface)'}
        stroke={isAccept ? 'var(--teal)' : 'var(--violet)'}
        strokeWidth={isAccept ? 2.5 : 1.5}
      />
      {isAccept && <circle r={RADIUS - 5} fill="none" stroke="var(--teal)" strokeWidth={1} />}
      {isCurrent && <circle r={RADIUS + 4} fill="none" stroke="var(--violet)" strokeWidth={2} opacity={0.5} />}
      <text textAnchor="middle" dominantBaseline="central" fontFamily="var(--mono)" fontSize={14} fontWeight={600} fill={isAccept ? 'var(--teal)' : 'var(--text-1)'}>
        {id}
      </text>
    </g>
  );
}

function ForwardEdge({ from, to, label, isActive }: { from: { x: number; y: number }; to: { x: number; y: number }; label: string; isActive: boolean }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  const ux = dx / dist;
  const uy = dy / dist;
  const startX = from.x + ux * RADIUS;
  const startY = from.y + uy * RADIUS;
  const endX = to.x - ux * (RADIUS + 8);
  const endY = to.y - uy * (RADIUS + 8);
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;

  return (
    <g>
      <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={isActive ? 'var(--violet)' : 'var(--border-strong)'} strokeWidth={isActive ? 2.5 : 1.2} />
      <polygon points="0,-5 10,0 0,5" fill={isActive ? 'var(--violet)' : 'var(--border-strong)'} transform={`translate(${endX}, ${endY}) rotate(${angle})`} />
      <g transform={`translate(${midX}, ${midY})`}>
        <rect x={-14} y={-11} width={28} height={20} rx={8} fill={isActive ? 'var(--violet-soft)' : 'var(--surface-2)'} stroke={isActive ? 'var(--violet)' : 'var(--border-strong)'} />
        <text textAnchor="middle" dominantBaseline="central" fontFamily="var(--mono)" fontSize={11} fontWeight={700} fill={isActive ? 'var(--violet)' : 'var(--text-1)'}>
          {label}
        </text>
      </g>
    </g>
  );
}

function BackwardArc({ from, to, label, isActive, laneHeight }: { from: { x: number; y: number }; to: { x: number; y: number }; label: string; isActive: boolean; laneHeight: number }) {
  const startX = from.x;
  const startY = from.y - RADIUS;
  const endX = to.x;
  const endY = to.y - RADIUS;
  const apexY = Math.min(startY, endY) - laneHeight;
  const midX = (startX + endX) / 2;
  const path = `M ${startX} ${startY} C ${startX} ${apexY}, ${endX} ${apexY}, ${endX} ${endY}`;
  const angle = (Math.atan2(endY - apexY, endX - startX) * 180) / Math.PI;

  return (
    <g>
      <path d={path} fill="none" stroke={isActive ? 'var(--violet)' : 'var(--border-strong)'} strokeWidth={isActive ? 2.5 : 1.2} />
      <polygon points="0,-5 10,0 0,5" fill={isActive ? 'var(--violet)' : 'var(--border-strong)'} transform={`translate(${endX}, ${endY}) rotate(${angle})`} />
      <g transform={`translate(${midX}, ${apexY - 12})`}>
        <rect x={-16} y={-10} width={32} height={20} rx={8} fill={isActive ? 'var(--violet-soft)' : 'var(--surface-2)'} stroke={isActive ? 'var(--violet)' : 'var(--border-strong)'} />
        <text textAnchor="middle" dominantBaseline="central" fontFamily="var(--mono)" fontSize={11} fontWeight={700} fill={isActive ? 'var(--violet)' : 'var(--text-1)'}>
          {label}
        </text>
      </g>
    </g>
  );
}

function SelfLoopArc({ x, y, label, isActive }: { x: number; y: number; label: string; isActive: boolean }) {
  const leftX = x - RADIUS * 0.55;
  const leftY = y - RADIUS * 0.83;
  const rightX = x + RADIUS * 0.55;
  const rightY = y - RADIUS * 0.83;
  const apexY = y - RADIUS - 44;
  const path = `M ${leftX} ${leftY} C ${leftX - 10} ${apexY}, ${rightX + 10} ${apexY}, ${rightX} ${rightY}`;
  const angle = (Math.atan2(rightY - apexY, rightX - leftX) * 180) / Math.PI;

  return (
    <g>
      <path d={path} fill="none" stroke={isActive ? 'var(--violet)' : 'var(--border-strong)'} strokeWidth={isActive ? 2.5 : 1.2} />
      <polygon points="0,-4 8,0 0,4" fill={isActive ? 'var(--violet)' : 'var(--border-strong)'} transform={`translate(${rightX}, ${rightY}) rotate(${angle})`} />
      <g transform={`translate(${x}, ${apexY - 8})`}>
        <rect x={-16} y={-10} width={32} height={20} rx={8} fill={isActive ? 'var(--violet-soft)' : 'var(--surface-2)'} stroke={isActive ? 'var(--violet)' : 'var(--border-strong)'} />
        <text textAnchor="middle" dominantBaseline="central" fontFamily="var(--mono)" fontSize={11} fontWeight={700} fill={isActive ? 'var(--violet)' : 'var(--text-1)'}>
          {label}
        </text>
      </g>
    </g>
  );
}

export default function DFACanvas({
  dfa,
  currentState,
  activeTransition,
  onStateClick,
}: {
  dfa: DFA;
  currentState?: string;
  activeTransition?: { from: string; symbol: string };
  onStateClick?: (id: string) => void;
}) {
  const { positions } = useMemo(() => bfsLayout(dfa), [dfa]);

  const { forwardEdges, backwardEdges, selfLoops } = useMemo(() => {
    const fwd: any[] = [];
    const bwd: any[] = [];
    const loops: any[] = [];

    Object.entries(dfa.transitions).forEach(([fromState, table]) => {
      const grouped: Record<string, string[]> = {};
      const selfLabels: string[] = [];

      Object.entries(table).forEach(([symbol, toState]) => {
        if (toState === fromState) {
          selfLabels.push(symbol);
        } else {
          if (!grouped[toState]) grouped[toState] = [];
          grouped[toState].push(symbol);
        }
      });

      Object.entries(grouped).forEach(([toState, symbols]) => {
        const isActive = activeTransition?.from === fromState && symbols.includes(activeTransition.symbol);
        const isBackward = positions[toState].x <= positions[fromState].x;
        const entry = { from: fromState, to: toState, label: symbols.join(', '), isActive };
        if (isBackward) bwd.push(entry);
        else fwd.push(entry);
      });

      if (selfLabels.length > 0) {
        const isActive = activeTransition?.from === fromState && selfLabels.includes(activeTransition.symbol);
        loops.push({ state: fromState, label: selfLabels.join(', '), isActive });
      }
    });

    const LANE_HEIGHT_STEP = 90;
    const BASE_HEIGHT = 60;

    const withSpan = bwd.map((e) => ({
      ...e,
      span: Math.round(Math.abs(positions[e.from].x - positions[e.to].x)),
    }));
    withSpan.sort((a, b) => a.span - b.span);

    let lane = 0;
    let lastSpan: number | null = null;
    withSpan.forEach((e: any) => {
      if (lastSpan !== null && e.span !== lastSpan) {
        lane += 1;
      }
      e.laneHeight = BASE_HEIGHT + lane * LANE_HEIGHT_STEP;
      lastSpan = e.span;
    });

    return { forwardEdges: fwd, backwardEdges: withSpan, selfLoops: loops };
  }, [positions, dfa, activeTransition]);

  const xs = Object.values(positions).map((p) => p.x);
  const ys = Object.values(positions).map((p) => p.y);

  const maxLaneHeight = Math.max(60, ...backwardEdges.map((e: any) => e.laneHeight ?? 0));

  const minX = Math.min(...xs) - 100;
  const maxX = Math.max(...xs) + 150;
  const minY = Math.min(...ys) - RADIUS - maxLaneHeight - 40;
  const maxY = Math.max(...ys) + 100;

  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <svg width={width} height={height} viewBox={`${minX} ${minY} ${width} ${height}`}>
        {forwardEdges.map((e, i) => (
          <ForwardEdge key={i} from={positions[e.from]} to={positions[e.to]} label={e.label} isActive={e.isActive} />
        ))}
        {backwardEdges.map((e: any, i) => (
          <BackwardArc key={i} from={positions[e.from]} to={positions[e.to]} label={e.label} isActive={e.isActive} laneHeight={e.laneHeight} />
        ))}
        {selfLoops.map((e, i) => (
          <SelfLoopArc key={i} x={positions[e.state].x} y={positions[e.state].y} label={e.label} isActive={e.isActive} />
        ))}
        {dfa.states.map((s) => (
          <StateCircle
            key={s}
            id={s}
            x={positions[s].x}
            y={positions[s].y}
            isAccept={dfa.acceptStates.includes(s)}
            isStart={s === dfa.startState}
            isCurrent={s === currentState}
            onClick={onStateClick ? () => onStateClick(s) : undefined}
          />
        ))}
      </svg>
    </div>
  );
}