import type { ParseTreeNode } from '../lib/cyk';

function TreeNode({ node }: { node: ParseTreeNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4 }}>
      <div
        style={{
          border: '1px solid #333',
          borderRadius: 6,
          padding: '4px 10px',
          background: '#fff',
        }}
      >
        {node.symbol}
      </div>
      {node.children && node.children.length > 0 && (
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ParseTreeViewer({ tree }: { tree: ParseTreeNode | null }) {
  if (!tree) return <p>No parse tree (string rejected or not yet parsed).</p>;
  return (
    <div style={{ overflowX: 'auto', padding: 20 }}>
      <TreeNode node={tree} />
    </div>
  );
}