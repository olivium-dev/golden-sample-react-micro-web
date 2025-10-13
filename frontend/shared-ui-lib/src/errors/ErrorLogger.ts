import { ErrorEntry, ErrorType, ErrorStats, ErrorFilter, ErrorLoggerConfig, AppError } from './types';

class ErrorLoggerService {
  private errors: ErrorEntry[] = [];
  private listeners: ((error: ErrorEntry) => void)[] = [];
  private config: ErrorLoggerConfig = {
    maxErrors: 100,
    enableConsoleLog: true,
    enableRemoteLogging: true,
    remoteEndpoint: 'http://localhost:8000/api/errors',
    enableToasts: true,
    enableLocalStorage: true,
  };

  private readonly STORAGE_KEY = 'micro-frontend-errors';

  constructor() {
    this.loadFromStorage();
    this.setupGlobalErrorHandlers();
  }

  public configure(config: Partial<ErrorLoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public logError(
    message: string,
    type: ErrorType = 'unknown',
    error?: Error,
    appName: string = this.getAppName(),
    additionalData?: Record<string, any>
  ): string {
    const errorEntry: ErrorEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      type,
      message,
      stack: error?.stack || new Error().stack,
      appName,
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity: this.determineSeverity(type, message),
      ...additionalData,
    };

    this.addError(errorEntry);
    return errorEntry.id;
  }

  public logAppError(appError: AppError): string {
    return this.logError(
      appError.message,
      appError.type,
      appError,
      appError.appName,
      { severity: appError.severity }
    );
  }

  public getErrors(filter?: ErrorFilter): ErrorEntry[] {
    let filteredErrors = [...this.errors];

    if (filter) {
      if (filter.type) {
        filteredErrors = filteredErrors.filter(e => e.type === filter.type);
      }
      if (filter.appName) {
        filteredErrors = filteredErrors.filter(e => e.appName === filter.appName);
      }
      if (filter.severity) {
        filteredErrors = filteredErrors.filter(e => e.severity === filter.severity);
      }
      if (filter.timeRange) {
        filteredErrors = filteredErrors.filter(
          e => e.timestamp >= filter.timeRange!.start && e.timestamp <= filter.timeRange!.end
        );
      }
    }

    return filteredErrors.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getStats(): ErrorStats {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);

    const byType: Record<ErrorType, number> = {
      react: 0,
      api: 0,
      network: 0,
      moduleFederation: 0,
      unknown: 0,
    };

    const byApp: Record<string, number> = {};
    let recent = 0;

    this.errors.forEach(error => {
      byType[error.type]++;
      byApp[error.appName] = (byApp[error.appName] || 0) + 1;
      if (error.timestamp >= fiveMinutesAgo) {
        recent++;
      }
    });

    return {
      total: this.errors.length,
      byType,
      byApp,
      recent,
    };
  }

  public clearErrors(): void {
    this.errors = [];
    this.saveToStorage();
  }

  public removeError(errorId: string): void {
    this.errors = this.errors.filter(e => e.id !== errorId);
    this.saveToStorage();
  }

  public subscribe(listener: (error: ErrorEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public exportErrors(): string {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      errors: this.errors,
      stats: this.getStats(),
    }, null, 2);
  }

  private addError(error: ErrorEntry): void {
    this.errors.unshift(error);
    
    // Limit the number of stored errors
    if (this.errors.length > this.config.maxErrors) {
      this.errors = this.errors.slice(0, this.config.maxErrors);
    }

    // Console logging
    if (this.config.enableConsoleLog) {
      console.group(`🚨 ${error.type.toUpperCase()} Error in ${error.appName}`);
      console.error(error.message);
      if (error.stack) {
        console.error(error.stack);
      }
      console.log('Error Details:', error);
      console.groupEnd();
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });

    // Save to storage
    if (this.config.enableLocalStorage) {
      this.saveToStorage();
    }

    // Send to remote endpoint
    if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
      this.sendToRemote(error);
    }
  }

  private async sendToRemote(error: ErrorEntry): Promise<void> {
    try {
      const response = await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });

      if (!response.ok) {
        console.warn('Failed to send error to remote endpoint:', response.statusText);
      }
    } catch (e) {
      console.warn('Failed to send error to remote endpoint:', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.errors));
    } catch (e) {
      console.warn('Failed to save errors to localStorage:', e);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load errors from localStorage:', e);
      this.errors = [];
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError(
        event.message || 'Unknown error',
        'unknown',
        event.error,
        this.getAppName(),
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        `Unhandled Promise Rejection: ${event.reason}`,
        'unknown',
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        this.getAppName()
      );
    });
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAppName(): string {
    // Try to determine app name from URL or other context
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (port) {
      switch (port) {
        case '3000': return 'container';
        case '3001': return 'user-management';
        case '3002': return 'data-grid';
        case '3003': return 'analytics';
        case '3004': return 'settings';
        default: return `app-${port}`;
      }
    }
    
    return hostname || 'unknown';
  }

  private determineSeverity(type: ErrorType, message: string): ErrorEntry['severity'] {
    // Determine severity based on error type and message
    if (type === 'moduleFederation' || message.toLowerCase().includes('module federation')) {
      return 'critical';
    }
    if (type === 'react' || message.toLowerCase().includes('react')) {
      return 'high';
    }
    if (type === 'api' || type === 'network') {
      return 'medium';
    }
    return 'low';
  }
}

// Create singleton instance
export const ErrorLogger = new ErrorLoggerService();

// Make it available globally for debugging and testing
if (typeof window !== 'undefined') {
  (window as any).ErrorLogger = ErrorLogger;
}

export default ErrorLogger;
