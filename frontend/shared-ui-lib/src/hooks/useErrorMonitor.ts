import { useState, useEffect, useCallback } from 'react';
import { ErrorEntry, ErrorStats, ErrorFilter } from '../errors/types';
import { ErrorLogger } from '../errors/ErrorLogger';

export interface UseErrorMonitorReturn {
  errors: ErrorEntry[];
  stats: ErrorStats;
  isLoading: boolean;
  clearErrors: () => void;
  removeError: (errorId: string) => void;
  refreshErrors: () => void;
  exportErrors: () => string;
  setFilter: (filter: ErrorFilter | undefined) => void;
  filter: ErrorFilter | undefined;
}

export function useErrorMonitor(
  initialFilter?: ErrorFilter,
  autoRefresh: boolean = true,
  refreshInterval: number = 5000
): UseErrorMonitorReturn {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [stats, setStats] = useState<ErrorStats>({
    total: 0,
    byType: { react: 0, api: 0, network: 0, moduleFederation: 0, unknown: 0 },
    byApp: {},
    recent: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<ErrorFilter | undefined>(initialFilter);

  const refreshErrors = useCallback(() => {
    setIsLoading(true);
    try {
      const filteredErrors = ErrorLogger.getErrors(filter);
      const currentStats = ErrorLogger.getStats();
      
      setErrors(filteredErrors);
      setStats(currentStats);
    } catch (error) {
      console.error('Failed to refresh errors:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  const clearErrors = useCallback(() => {
    ErrorLogger.clearErrors();
    refreshErrors();
  }, [refreshErrors]);

  const removeError = useCallback((errorId: string) => {
    ErrorLogger.removeError(errorId);
    refreshErrors();
  }, [refreshErrors]);

  const exportErrors = useCallback(() => {
    return ErrorLogger.exportErrors();
  }, []);

  // Subscribe to new errors
  useEffect(() => {
    const unsubscribe = ErrorLogger.subscribe((newError: ErrorEntry) => {
      // Only refresh if the new error matches the current filter
      if (!filter || matchesFilter(newError, filter)) {
        refreshErrors();
      }
    });

    return unsubscribe;
  }, [filter, refreshErrors]);

  // Initial load
  useEffect(() => {
    refreshErrors();
  }, [refreshErrors]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshErrors, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshErrors]);

  return {
    errors,
    stats,
    isLoading,
    clearErrors,
    removeError,
    refreshErrors,
    exportErrors,
    setFilter,
    filter,
  };
}

function matchesFilter(error: ErrorEntry, filter: ErrorFilter): boolean {
  if (filter.type && error.type !== filter.type) {
    return false;
  }
  
  if (filter.appName && error.appName !== filter.appName) {
    return false;
  }
  
  if (filter.severity && error.severity !== filter.severity) {
    return false;
  }
  
  if (filter.timeRange) {
    if (error.timestamp < filter.timeRange.start || error.timestamp > filter.timeRange.end) {
      return false;
    }
  }
  
  return true;
}

export default useErrorMonitor;




