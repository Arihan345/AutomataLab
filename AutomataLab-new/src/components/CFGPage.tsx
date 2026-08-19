import { useState } from 'react';
import CFGInput from './CFGInput';
import CFGSimulator from './CFGSimulator';
import SaveLoadPanel from './SaveLoadPanel';
import type { CFG } from '../types/cfg';

export default function CFGPage() {
  const [currentCfg, setCurrentCfg] = useState<CFG | null>(null);

  return (
    <div style={{ display: 'flex', minHeight: '80vh' }}>
      <div style={{ width: 320 }}>
        <CFGInput onSubmit={setCurrentCfg} />
        {currentCfg && (
          <>
            <SaveLoadPanel type="cfg" currentData={currentCfg} onLoad={setCurrentCfg} />
            <CFGSimulator cfg={currentCfg} />
          </>
        )}
      </div>
    </div>
  );
}