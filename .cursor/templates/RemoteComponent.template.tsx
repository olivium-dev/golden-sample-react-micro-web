import React, { Suspense, lazy } from "react";
import ErrorBoundary from "./ErrorBoundary";

// Template for loading remote components with proper error handling and loading states

interface RemoteComponentProps {
  // Add specific props for your remote component
  [key: string]: any;
}

interface RemoteWrapperProps extends RemoteComponentProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

// Lazy load the remote component
const RemoteComponent = lazy(() => 
  import("{{REMOTE_NAME}}/{{COMPONENT_NAME}}")
    .catch((error) => {
      console.error(`Failed to load remote component {{REMOTE_NAME}}/{{COMPONENT_NAME}}:`, error);
      
      // Return a fallback component for failed imports
      return {
        default: () => (
          <div className="remote-load-error">
            <h3>Unable to load {{COMPONENT_NAME}}</h3>
            <p>The {{REMOTE_NAME}} service is currently unavailable.</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        )
      };
    })
);

/**
 * Wrapper component for remote micro-frontend components
 * Provides error boundaries, loading states, and fallback handling
 */
const RemoteWrapper: React.FC<RemoteWrapperProps> = ({
  fallback,
  errorFallback,
  onError,
  ...props
}) => {
  const defaultFallback = (
    <div className="remote-loading">
      <div className="loading-spinner"></div>
      <p>Loading {{COMPONENT_NAME}}...</p>
      
      <style jsx>{`
        .remote-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #6b7280;
        }
        
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  const defaultErrorFallback = (
    <div className="remote-error">
      <h3>⚠️ Service Unavailable</h3>
      <p>The {{COMPONENT_NAME}} service is temporarily unavailable.</p>
      <p>Please try again later or contact support if the problem persists.</p>
      
      <style jsx>{`
        .remote-error {
          padding: 20px;
          text-align: center;
          background-color: #fef3cd;
          border: 1px solid #fde68a;
          border-radius: 8px;
          margin: 20px;
          color: #92400e;
        }
        
        .remote-error h3 {
          margin-bottom: 12px;
          color: #d97706;
        }
        
        .remote-error p {
          margin: 8px 0;
        }
      `}</style>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={errorFallback || defaultErrorFallback}
      onError={onError}
    >
      <Suspense fallback={fallback || defaultFallback}>
        <RemoteComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default RemoteWrapper;

// Usage Example:
// 
// import AuthPageWrapper from './components/RemoteWrapper';
// 
// // In your component:
// <AuthPageWrapper 
//   fallback={<CustomLoadingSpinner />}
//   errorFallback={<CustomErrorMessage />}
//   onError={(error, errorInfo) => {
//     // Log to error tracking service
//     console.error('Auth page failed to load:', error);
//   }}
//   // Pass any props needed by the remote component
//   userId={currentUser.id}
//   onAuthSuccess={handleAuthSuccess}
// />
