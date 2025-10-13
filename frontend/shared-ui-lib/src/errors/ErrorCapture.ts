import { ErrorLogger } from './ErrorLogger';
import { ErrorType } from './types';

export class ErrorCapture {
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) {
      return;
    }

    this.setupNetworkErrorCapture();
    this.setupModuleFederationErrorCapture();
    this.setupConsoleErrorCapture();
    
    this.initialized = true;
    console.log('🔍 ErrorCapture initialized');
  }

  private static setupNetworkErrorCapture(): void {
    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          ErrorLogger.logError(
            `Network request failed: ${response.status} ${response.statusText}`,
            'network',
            new Error(`HTTP ${response.status}`),
            undefined,
            {
              url: args[0],
              status: response.status,
              statusText: response.statusText,
            }
          );
        }
        
        return response;
      } catch (error) {
        ErrorLogger.logError(
          `Network request error: ${error instanceof Error ? error.message : String(error)}`,
          'network',
          error instanceof Error ? error : new Error(String(error)),
          undefined,
          {
            url: args[0],
          }
        );
        throw error;
      }
    };

    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]): void {
      (this as any)._method = method;
      (this as any)._url = url;
      return originalXHROpen.apply(this, [method, url, ...args] as any);
    };

    XMLHttpRequest.prototype.send = function(...args: any[]): void {
      const xhr = this as any;
      
      const originalOnError = xhr.onerror;
      xhr.onerror = function(event: ProgressEvent) {
        ErrorLogger.logError(
          `XMLHttpRequest error: ${xhr._method} ${xhr._url}`,
          'network',
          new Error('XMLHttpRequest failed'),
          undefined,
          {
            method: xhr._method,
            url: xhr._url,
            status: xhr.status,
            statusText: xhr.statusText,
          }
        );
        
        if (originalOnError) {
          originalOnError.call(xhr, event);
        }
      };

      const originalOnLoad = xhr.onload;
      xhr.onload = function(event: ProgressEvent) {
        if (xhr.status >= 400) {
          ErrorLogger.logError(
            `XMLHttpRequest HTTP error: ${xhr.status} ${xhr.statusText}`,
            'network',
            new Error(`HTTP ${xhr.status}`),
            undefined,
            {
              method: xhr._method,
              url: xhr._url,
              status: xhr.status,
              statusText: xhr.statusText,
            }
          );
        }
        
        if (originalOnLoad) {
          originalOnLoad.call(xhr, event);
        }
      };

      return originalXHRSend.apply(this, args as any);
    };
  }

  private static setupModuleFederationErrorCapture(): void {
    // Capture Module Federation loading errors
    // Note: Module Federation errors are best caught by ErrorBoundary
    // wrapping React.lazy imports. Direct webpack interception is complex
    // and not TypeScript-safe, so we rely on React error boundaries instead.
    
    // The ErrorBoundary component will catch:
    // 1. Failed lazy imports (import() errors)
    // 2. Remote module loading failures
    // 3. Chunk loading errors
    
    // For additional coverage, we can listen for script loading errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        // Check if it's a script loading error (Module Federation remote)
        if (event.target instanceof HTMLScriptElement) {
          const scriptSrc = event.target.src;
          if (scriptSrc && (scriptSrc.includes('remoteEntry') || scriptSrc.includes('webpack'))) {
            ErrorLogger.logError(
              `Module Federation script loading error: ${scriptSrc}`,
              'moduleFederation',
              new Error(`Failed to load script: ${scriptSrc}`),
              undefined,
              {
                src: scriptSrc,
                severity: 'critical',
              }
            );
          }
        }
      }, true); // Use capture phase
    }
  }

  private static setupConsoleErrorCapture(): void {
    // Capture console.error calls (but avoid infinite loops)
    const originalConsoleError = console.error;
    console.error = function(...args) {
      // Only log to ErrorLogger if it's not already an ErrorLogger message
      const message = args.join(' ');
      if (!message.includes('🚨') && !message.includes('ErrorLogger')) {
        ErrorLogger.logError(
          `Console Error: ${message}`,
          'unknown',
          new Error(message)
        );
      }
      
      return originalConsoleError.apply(console, args);
    };

    // Capture console.warn for potential issues
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
      const message = args.join(' ');
      
      // Log certain warnings as errors
      if (message.toLowerCase().includes('failed') || 
          message.toLowerCase().includes('error') ||
          message.toLowerCase().includes('module federation')) {
        ErrorLogger.logError(
          `Console Warning: ${message}`,
          'unknown',
          new Error(message),
          undefined,
          { severity: 'low' }
        );
      }
      
      return originalConsoleWarn.apply(console, args);
    };
  }

  public static captureApiError(error: any, endpoint: string, method: string = 'GET'): void {
    ErrorLogger.logError(
      `API Error: ${method} ${endpoint} - ${error.message || error}`,
      'api',
      error instanceof Error ? error : new Error(String(error)),
      undefined,
      {
        endpoint,
        method,
        status: error.status || error.response?.status,
        statusText: error.statusText || error.response?.statusText,
      }
    );
  }

  public static captureReactError(error: Error, errorInfo: any, componentName?: string): string {
    return ErrorLogger.logError(
      `React Error in ${componentName || 'Unknown Component'}: ${error.message}`,
      'react',
      error,
      undefined,
      {
        componentStack: errorInfo.componentStack,
        componentName,
      }
    );
  }

  public static captureModuleFederationError(moduleName: string, error: any): void {
    ErrorLogger.logError(
      `Module Federation Error: Failed to load ${moduleName}`,
      'moduleFederation',
      error instanceof Error ? error : new Error(String(error)),
      undefined,
      {
        moduleName,
        severity: 'critical',
      }
    );
  }
}

export default ErrorCapture;
