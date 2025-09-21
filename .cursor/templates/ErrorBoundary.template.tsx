import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

/**
 * Enhanced Error Boundary for Micro-Frontend Applications
 * Handles remote module loading failures with retry logic
 */
class ErrorBoundary extends Component<Props, State> {
  private maxRetries: number;

  constructor(props: Props) {
    super(props);
    this.maxRetries = props.maxRetries || 3;
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Report to error tracking service
    this.props.onError?.(error, errorInfo);
    
    // You can also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  retry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI with retry
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>🚨 Something went wrong</h2>
            <details className="error-details">
              <summary>Error Details</summary>
              <pre>{this.state.error?.message}</pre>
              <pre>{this.state.error?.stack}</pre>
            </details>
            
            {this.state.retryCount < this.maxRetries ? (
              <div className="error-actions">
                <button 
                  onClick={this.retry}
                  className="retry-button"
                >
                  🔄 Retry ({this.state.retryCount + 1}/{this.maxRetries})
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="reload-button"
                >
                  🔃 Reload Page
                </button>
              </div>
            ) : (
              <div className="error-actions">
                <p>Maximum retry attempts reached.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="reload-button"
                >
                  🔃 Reload Page
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="home-button"
                >
                  🏠 Go Home
                </button>
              </div>
            )}
          </div>
          
          <style jsx>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 200px;
              padding: 20px;
              background-color: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 8px;
              margin: 20px;
            }
            
            .error-content {
              text-align: center;
              max-width: 500px;
            }
            
            .error-content h2 {
              color: #dc2626;
              margin-bottom: 16px;
            }
            
            .error-details {
              margin: 16px 0;
              text-align: left;
            }
            
            .error-details summary {
              cursor: pointer;
              color: #6b7280;
              margin-bottom: 8px;
            }
            
            .error-details pre {
              background-color: #f9fafb;
              padding: 12px;
              border-radius: 4px;
              overflow-x: auto;
              font-size: 12px;
              color: #374151;
            }
            
            .error-actions {
              margin-top: 20px;
            }
            
            .error-actions button {
              margin: 0 8px;
              padding: 8px 16px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
            }
            
            .retry-button {
              background-color: #3b82f6;
              color: white;
            }
            
            .retry-button:hover {
              background-color: #2563eb;
            }
            
            .reload-button, .home-button {
              background-color: #6b7280;
              color: white;
            }
            
            .reload-button:hover, .home-button:hover {
              background-color: #4b5563;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
