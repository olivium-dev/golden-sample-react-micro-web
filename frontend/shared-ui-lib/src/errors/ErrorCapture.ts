/**
 * ErrorCapture - DISABLED VERSION
 * 
 * This class was causing infinite loops and browser crashes.
 * All error capture functionality has been disabled.
 */
export class ErrorCapture {
  private static initialized = false;

  /**
   * Initialize error capture system - DISABLED
   */
  public static initialize(): void {
    console.log('🔧 ErrorCapture initialization DISABLED to prevent crashes');
    ErrorCapture.initialized = true;
    return;
  }

  /**
   * Capture API errors - DISABLED
   */
  public static captureApiError(error: any, endpoint: string, method: string = 'GET'): void {
    // Just log to console, don't send to backend
    const status = error.status || error.response?.status;
    console.warn(`API Error: ${method} ${endpoint} - ${error.message || error} (Status: ${status})`);
  }

  /**
   * Capture React errors - DISABLED
   */
  public static captureReactError(error: Error, errorInfo: any, componentName?: string): string {
    console.error(`React Error in ${componentName || 'Unknown Component'}: ${error.message}`);
    return 'error-disabled';
  }

  /**
   * Capture Module Federation errors - DISABLED
   */
  public static captureModuleFederationError(moduleName: string, error: any): string {
    console.error(`Module Federation Error in ${moduleName}: ${error instanceof Error ? error.message : String(error)}`);
    return 'error-disabled';
  }

  /**
   * Capture network errors - DISABLED
   */
  public static captureNetworkError(url: string, error: any): string {
    console.error(`Network Error for ${url}: ${error instanceof Error ? error.message : String(error)}`);
    return 'error-disabled';
  }

  /**
   * Get error count - DISABLED
   */
  public static getErrorCount(): number {
    return 0;
  }

  /**
   * Clear errors - DISABLED
   */
  public static clearErrors(): void {
    console.log('Error clearing disabled');
  }
}