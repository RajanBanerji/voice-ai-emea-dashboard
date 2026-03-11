import React, { createContext, useContext, useState } from 'react';

interface ModeContextType {
  isDevMode: boolean;
  toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | null>(null);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDevMode, setIsDevMode] = useState(() => {
    return localStorage.getItem('sb_devmode') === 'true';
  });

  const toggleMode = () => {
    setIsDevMode(prev => {
      const next = !prev;
      localStorage.setItem('sb_devmode', String(next));
      return next;
    });
  };

  return (
    <ModeContext.Provider value={{ isDevMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export function useMode(): ModeContextType {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within ModeProvider');
  return ctx;
}
