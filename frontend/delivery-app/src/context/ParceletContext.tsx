import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Parcelet } from '../utils/localStorage';
import { deliveryGatewayClient } from '../services/deliveryGatewayClient';

interface ParceletContextType {
  parcelets: Parcelet[];
  isLoading: boolean;
  error: Error | null;
  refreshParcelets: () => Promise<void>;
  updateParcelet: (updatedParcelet: Parcelet) => void;
  resetParcelets: () => Promise<void>;
  lastUpdated: Date | null;
  isResetting: boolean;
  advanceParcelet: (id: number) => Promise<Parcelet>;
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

  // Function to fetch parcelets from Gateway API
  const fetchParcelets = async () => {
    try {
      setIsLoading(true);
      const fetchedParcelets = await deliveryGatewayClient.getParcelets();

      setParcelets(fetchedParcelets);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(`Failed to fetch data from delivery gateway: ${errorMessage}. Please check the gateway service connection.`));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh parcelets
  const refreshParcelets = async () => {
    await fetchParcelets();
  };

  // Function to reset parcelets (fetch fresh data from gateway)
  const resetParcelets = async () => {
    try {
      setIsResetting(true);

      // Fetch fresh data from gateway
      const freshParcelets = await deliveryGatewayClient.resetParcelets();

      setParcelets(freshParcelets);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(`Failed to refresh data from delivery gateway: ${errorMessage}. Please check the gateway service connection.`));
    } finally {
      setIsResetting(false);
    }
  };

  // Function to update a single parcelet in state only
  const updateParcelet = (updatedParcelet: Parcelet) => {
    setParcelets(prev =>
      prev.map(p => p.id === updatedParcelet.id ? updatedParcelet : p)
    );
    setLastUpdated(new Date());
  };

  // Function to advance a parcelet status using Gateway API
  const advanceParcelet = async (id: number): Promise<Parcelet> => {
    const updatedParcelet = await deliveryGatewayClient.advanceParcelet(id);

    // Update local state
    updateParcelet(updatedParcelet);
    return updatedParcelet;
  };

  // Load parcelets from API on mount
  useEffect(() => {
    fetchParcelets();
  }, []);

  const value = {
    parcelets,
    isLoading,
    error,
    refreshParcelets,
    updateParcelet,
    resetParcelets,
    lastUpdated,
    isResetting,
    advanceParcelet
  };

  return (
    <ParceletContext.Provider value={value}>
      {children}
    </ParceletContext.Provider>
  );
};
