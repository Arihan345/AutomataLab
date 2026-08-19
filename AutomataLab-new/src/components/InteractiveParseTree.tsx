import { useState, useRef, useLayoutEffect } from 'react';
import type { ParseTreeNode } from '../lib/cyk';

function getDepth(node: ParseTreeNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(getDepth));
}

function Node({
  node,
  onSelect,
  isRoot,
  levelGap,
}: {
  node: ParseTreeNode;
  onSelect: (n: ParseTreeNode, isRoot: boolean) => void;
  isRoot?: boolean;
  levelGap: number;
}) {
  const isTerminal = !node.children || node.children.length === 0;
  const nodeSize = levelGap < 60 ? { padding: '6px 12px', fontSize: 13 } : { padding: '10px 20px', fontSize: 17 };

  const buttonRef = useRef<HTMLButtonElement>(null);
  const childRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [connectorPaths, setConnectorPaths] = useState<{ trunk: string; branch: string | null; drops: string[] } | null>(null);

  useLayoutEffect(() => {
    if (!node.children || node.children.length === 0 || !buttonRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const parentRect = buttonRef.current.getBoundingClientRect();
    const parentCenterX = parentRect.left + parentRect.width / 2 - containerRect.left;
    const parentBottomY = parentRect.bottom - containerRect.top;

    const childCenters = childRefs.current
      .filter((el): el is HTMLDivElement => !!el)
      .map((el) => {
        const firstButton = el.querySelector('button');
        const rect = (firstButton ?? el).getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top - containerRect.top,
        };
      });

    if (childCenters.length === 0) return;

    const branchY = parentBottomY + levelGap / 2;
    const trunk = `M ${parentCenterX} ${parentBottomY} L ${parentCenterX} ${branchY}`;
    const branch = childCenters.length > 1
      ? `M ${childCenters[0].x} ${branchY} L ${childCenters[childCenters.length - 1].x} ${branchY}`
      : null;
    const drops = childCenters.map((c) => `M ${c.x} ${branchY} L ${c.x} ${c.y}`);

    setConnectorPaths({ trunk, branch, drops });
  }, [node, levelGap]);

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={() => onSelect(node, !!isRoot)}
        style={{
          border: `2px solid ${isTerminal ? 'var(--teal)' : 'var(--violet)'}`,
          background: isTerminal ? 'var(--teal-soft)' : 'var(--violet-soft)',
          color: isTerminal ? 'var(--teal)' : 'var(--text-1)',
          borderRadius: 8,
          padding: nodeSize.padding,
          fontFamily: 'var(--mono)',
          fontSize: nodeSize.fontSize,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'block',
          margin: 0,
          lineHeight: 1,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {node.symbol}
      </button>

      {node.children && node.children.length > 0 && (
        <>
          {connectorPaths && (
            <svg
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}
            >
              <path d={connectorPaths.trunk} stroke="var(--border-strong)" strokeWidth="1.5" fill="none" />
              {connectorPaths.branch && <path d={connectorPaths.branch} stroke="var(--border-strong)" strokeWidth="1.5" fill="none" />}
              {connectorPaths.drops.map((d, i) => (
                <path key={i} d={d} stroke="var(--border-strong)" strokeWidth="1.5" fill="none" />
              ))}
            </svg>
          )}
          <div style={{ display: 'flex', gap: levelGap < 60 ? 16 : 36, marginTop: levelGap }}>
            {node.children.map((c, i) => (
              <div key={i} ref={(el) => {(childRefs.current[i] = el)}}>
                <Node node={c} onSelect={onSelect} levelGap={levelGap} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function InteractiveParseTree({ tree }: { tree: ParseTreeNode }) {
  const [selected, setSelected] = useState<{ node: ParseTreeNode; isRoot: boolean } | null>(null);
  const depth = getDepth(tree);
  const levelGap = Math.max(30, Math.min(70, 600 / depth));

  function renderFooter() {
    if (!selected) {
      return <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Click a node to see which production produced it.</p>;
    }
    const { node, isRoot } = selected;

    if (isRoot) {
      return (
        <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--violet)' }}>
          <span style={{ fontWeight: 700 }}>{node.symbol}</span> — start symbol of the grammar.
          {node.production && (
            <>
              {' '}First production: <span style={{ color: 'var(--violet)' }}>{node.production}</span>
            </>
          )}
        </p>
      );
    }

    if (!node.production) {
      return (
        <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--teal)' }}>
          "{node.symbol}" — terminal symbol, matched directly from the input string.
        </p>
      );
    }

    return (
      <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-1)' }}>
        <span style={{ color: 'var(--violet)' }}>{node.symbol}</span> produced via{' '}
        <span style={{ color: 'var(--violet)' }}>{node.production}</span>
        {node.children && node.children.length > 1 && (
          <> — splits into {node.children.map((c) => c.symbol).join(' and ')}</>
        )}
      </p>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="cyk-scroll" style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'center', minWidth: 'fit-content' }}>
          <Node node={tree} onSelect={(n, isRoot) => setSelected({ node: n, isRoot })} isRoot levelGap={levelGap} />
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', padding: 14, minHeight: 44, flexShrink: 0 }}>
        {renderFooter()}
      </div>
    </div>
  );
}