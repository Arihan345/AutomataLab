import { createContext, useContext, useState, useEffect } from 'react';

const FocusContext = createContext<{ focused: boolean; toggle: () => void }>({ focused: false, toggle: () => {} });

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFocused(false);
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key.toLowerCase() === 'f' && tag !== 'INPUT' && tag !== 'TEXTAREA') setFocused((f) => !f);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return <FocusContext.Provider value={{ focused, toggle: () => setFocused((f) => !f) }}>{children}</FocusContext.Provider>;
}
export const useFocus = () => useContext(FocusContext);