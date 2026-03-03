import React, { createContext, useContext, useState, useCallback } from 'react';

const MAX_COMPARE = 4;

interface CompareContextType {
  compareList: string[];
  addToCompare: (vendorName: string) => void;
  removeFromCompare: (vendorName: string) => void;
  clearCompare: () => void;
  isInCompare: (vendorName: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<string[]>([]);

  const addToCompare = useCallback((vendorName: string) => {
    setCompareList((prev) => {
      if (prev.includes(vendorName) || prev.length >= MAX_COMPARE) {
        return prev;
      }
      return [...prev, vendorName];
    });
  }, []);

  const removeFromCompare = useCallback((vendorName: string) => {
    setCompareList((prev) => prev.filter((name) => name !== vendorName));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback(
    (vendorName: string) => compareList.includes(vendorName),
    [compareList]
  );

  return (
    <CompareContext.Provider
      value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextType {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
