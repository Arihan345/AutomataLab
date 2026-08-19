import { useState } from 'react';
import TMInput from './TMInput';
import TMSimulator from './TMSimulator';
import SaveLoadPanel from './SaveLoadPanel';
import type { TM } from '../types/tm';

export default function TMPage() {
  const [currentTm, setCurrentTm] = useState<TM | null>(null);

  return (
    <div style={{ display: 'flex', minHeight: '80vh' }}>
      <div style={{ width: 320 }}>
        <TMInput onSubmit={setCurrentTm} />
        {currentTm && (
          <>
            <SaveLoadPanel type="tm" currentData={currentTm} onLoad={setCurrentTm} />
            <TMSimulator tm={currentTm} />
          </>
        )}
      </div>
    </div>
  );
}