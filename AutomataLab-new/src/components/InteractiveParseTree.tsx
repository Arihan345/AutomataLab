import { useState } from 'react';
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button
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
        }}
      >
        {node.symbol}
      </button>

      {node.children && node.children.length > 0 && (
        <div style={{ display: 'flex', position: 'relative', marginTop: levelGap }}>
          <div style={{ position: 'absolute', top: -levelGap, left: 0, right: 0, height: levelGap, pointerEvents: 'none' }}>
            <svg width="100%" height={levelGap} style={{ overflow: 'visible', display: 'block' }}>
              <line x1="50%" y1="0" x2="50%" y2={levelGap / 2} stroke="var(--border-strong)" strokeWidth="1.5" />
              {node.children.length > 1 && (
                <line x1="25%" y1={levelGap / 2} x2="75%" y2={levelGap / 2} stroke="var(--border-strong)" strokeWidth="1.5" />
              )}
              {node.children.map((_, i) => {
                const pos = node.children!.length === 1 ? 50 : 25 + i * 50;
                return (
                  <line
                    key={i}
                    x1={`${pos}%`}
                    y1={levelGap / 2}
                    x2={`${pos}%`}
                    y2={levelGap}
                    stroke="var(--border-strong)"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>
          <div style={{ display: 'flex', gap: levelGap < 60 ? 16 : 36 }}>
            {node.children.map((c, i) => (
              <Node key={i} node={c} onSelect={onSelect} levelGap={levelGap} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InteractiveParseTree({ tree }: { tree: ParseTreeNode }) {
  const [selected, setSelected] = useState<{ node: ParseTreeNode; isRoot: boolean } | null>(null);
  const depth = getDepth(tree);
  const levelGap = Math.max(40, Math.min(70, 500 / depth));

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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/*
        alignItems: 'flex-start' (not 'center') is the actual fix.
        Centering vertically pushed tall trees' roots above the scrollable
        area. flex-start anchors the root at the top and lets the tree
        grow downward, scrolling within this container if it's taller
        than the viewport — root is always visible on load.
      */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '40px 40px 24px',
          overflow: 'auto',
        }}
      >
        <Node node={tree} onSelect={(n, isRoot) => setSelected({ node: n, isRoot })} isRoot levelGap={levelGap} />
      </div>
      <div style={{ borderTop: '1px solid var(--border)', padding: 14, minHeight: 44, flexShrink: 0 }}>
        {renderFooter()}
      </div>
    </div>
  );
}