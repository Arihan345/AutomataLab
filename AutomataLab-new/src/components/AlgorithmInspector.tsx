export default function AlgorithmInspector({ steps }: { steps: string[] }) {
  return (
    <div style={{ padding: 10, maxWidth: 300 }}>
      <h3>Algorithm Steps</h3>
      <ol>
        {steps.map((step, i) => (
          <li key={i} style={{ marginBottom: 8 }}>{step}</li>
        ))}
      </ol>
    </div>
  );
}