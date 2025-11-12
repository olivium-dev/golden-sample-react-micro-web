import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Parcelet, 
  getParceletsFromLocalStorage, 
  saveParceletsToLocalStorage, 
  updateParceletInLocalStorage,
  clearParceletsFromLocalStorage
} from '../utils/localStorage';
import { mockApiClient } from '../services/mockApiClient';

interface ParceletContextType {
  parcelets: Parcelet[];
  isLoading: boolean;
  error: Error | null;
  refreshParcelets: () => Promise<void>;
  updateParcelet: (updatedParcelet: Parcelet) => void;
  resetParcelets: () => Promise<void>;
  lastUpdated: Date | null;
  isResetting: boolean;
}

const ParceletContext = createContext<ParceletContextType | undefined>(undefined);

export const useParceletContext = () => {
  const context = useContext(ParceletContext);
  if (!context) {
    throw new Error('useParceletContext must be used within a ParceletProvider');
  }
  return context;
};

interface ParceletProviderProps {
  children: ReactNode;
}

export const ParceletProvider: React.FC<ParceletProviderProps> = ({ children }) => {
  const [parcelets, setParcelets] = useState<Parcelet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Function to fetch parcelets from API
  const fetchParcelets = async () => {
    try {
      setIsLoading(true);
      const response = await mockApiClient.get('/parcelets/');
      const fetchedParcelets = response.data;
      setParcelets(fetchedParcelets);
      saveParceletsToLocalStorage(fetchedParcelets);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch parcelets'));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh parcelets
  const refreshParcelets = async () => {
    await fetchParcelets();
  };

  // Function to reset parcelets (clear local storage and fetch fresh data)
  const resetParcelets = async () => {
    try {
      setIsResetting(true);
      // Clear local storage
      clearParceletsFromLocalStorage();
      // Call the reset endpoint to get original data
      const response = await mockApiClient.put('/parcelets/reset');
      const resetParcelets = response.data;
      setParcelets(resetParcelets);
      saveParceletsToLocalStorage(resetParcelets);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reset parcelets'));
    } finally {
      setIsResetting(false);
    }
  };

  // Function to update a single parcelet
  const updateParcelet = (updatedParcelet: Parcelet) => {
    setParcelets(prev => 
      prev.map(p => p.id === updatedParcelet.id ? updatedParcelet : p)
    );
    updateParceletInLocalStorage(updatedParcelet);
    setLastUpdated(new Date());
  };

  // Load parcelets from local storage on mount
  useEffect(() => {
    const loadParcelets = async () => {
      setIsLoading(true);
      try {
        // Try to get from local storage first
        const storedParcelets = getParceletsFromLocalStorage();
        
        if (storedParcelets && storedParcelets.length > 0) {
          setParcelets(storedParcelets);
          setLastUpdated(new Date());
          setIsLoading(false);
        } else {
          // If not in local storage, fetch from API
          await fetchParcelets();
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load parcelets'));
        setIsLoading(false);
      }
    };

    loadParcelets();
  }, []);

  // Save to local storage whenever parcelets change
  useEffect(() => {
    if (parcelets.length > 0) {
      saveParceletsToLocalStorage(parcelets);
    }
  }, [parcelets]);

  const value = {
    parcelets,
    isLoading,
    error,
    refreshParcelets,
    updateParcelet,
    resetParcelets,
    lastUpdated,
    isResetting
  };

  return (
    <ParceletContext.Provider value={value}>
      {children}
    </ParceletContext.Provider>
  );
};
