// components/PDAPage.tsx
import { useState } from 'react';
import PDAInput from './PDAInput';
import PDAViewer from './PDAViewer';
import PDASimulator from './PDASimulator';
import SaveLoadPanel from './SaveLoadPanel';
import type { PDA } from '../types/pda';

export default function PDAPage() {
  const [currentPda, setCurrentPda] = useState<PDA | null>(null);

  return (
    <div style={{ display: 'flex', minHeight: '80vh' }}>
      <div style={{ width: 300 }}>
        <PDAInput onSubmit={setCurrentPda} />
        {currentPda && (
          <>
            <SaveLoadPanel type="pda" currentData={currentPda} onLoad={setCurrentPda} />
            <PDASimulator pda={currentPda} />
          </>
        )}
      </div>
      {currentPda && <div style={{ flex: 1 }}><PDAViewer pda={currentPda} /></div>}
    </div>
  );
}