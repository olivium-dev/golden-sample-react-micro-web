export type ErrorType = 'react' | 'api' | 'network' | 'moduleFederation' | 'unknown';

export interface ErrorEntry {
  id: string;
  timestamp: number;
  type: ErrorType;
  message: string;
  stack?: string;
  appName: string;
  url: string;
  userAgent: string;
  componentStack?: string;
  props?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorStats {
  total: number;
  byType: Record<ErrorType, number>;
  byApp: Record<string, number>;
  recent: number; // errors in last 5 minutes
}

export interface ErrorFilter {
  type?: ErrorType;
  appName?: string;
  severity?: ErrorEntry['severity'];
  timeRange?: {
    start: number;
    end: number;
  };
}

export interface ErrorLoggerConfig {
  maxErrors: number;
  enableConsoleLog: boolean;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  enableToasts: boolean;
  enableLocalStorage: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: {
    componentStack: string;
  };
  errorId?: string;
}

export interface ErrorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  maxHeight?: number;
}

export interface ErrorToastProps {
  error: ErrorEntry;
  onDismiss: (errorId: string) => void;
  autoHideDuration?: number;
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorEntry['severity'];
  public readonly appName: string;
  public readonly timestamp: number;

  constructor(
    message: string,
    type: ErrorType = 'unknown',
    severity: ErrorEntry['severity'] = 'medium',
    appName: string = 'unknown'
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.appName = appName;
    this.timestamp = Date.now();
  }
}
