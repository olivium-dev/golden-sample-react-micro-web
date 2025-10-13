import React, { Component, ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';
import { ErrorBoundaryState } from '../errors/types';
import { ErrorCapture } from '../errors/ErrorCapture';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: any, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  componentName?: string;
  showDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error using ErrorCapture
    const errorId = ErrorCapture.captureReactError(error, errorInfo, this.props.componentName);
    
    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
  };

  private handleCopyError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorDetails = {
      id: errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2)).then(() => {
      console.log('Error details copied to clipboard');
    }).catch(() => {
      console.log('Failed to copy error details');
    });
  };

  private renderDefaultFallback() {
    const { error, errorInfo, errorId } = this.state;
    const { componentName, showDetails = true } = this.props;

    return (
      <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BugIcon />
            <Typography variant="h6">
              Something went wrong in {componentName || 'this component'}
            </Typography>
          </Stack>
        </Alert>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  An unexpected error occurred. You can try refreshing this component or report the issue.
                </Typography>
                {errorId && (
                  <Chip 
                    label={`Error ID: ${errorId}`} 
                    size="small" 
                    variant="outlined" 
                    sx={{ fontFamily: 'monospace' }}
                  />
                )}
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                  color="primary"
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={this.handleCopyError}
                >
                  Copy Error Details
                </Button>
              </Stack>

              {showDetails && error && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Error Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Error Message:
                        </Typography>
                        <Typography
                          variant="body2"
                          component="pre"
                          sx={{
                            backgroundColor: 'grey.100',
                            p: 1,
                            borderRadius: 1,
                            fontSize: '0.875rem',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {error.message}
                        </Typography>
                      </Box>

                      {error.stack && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Stack Trace:
                          </Typography>
                          <Typography
                            variant="body2"
                            component="pre"
                            sx={{
                              backgroundColor: 'grey.100',
                              p: 1,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              maxHeight: 200,
                              overflow: 'auto',
                            }}
                          >
                            {error.stack}
                          </Typography>
                        </Box>
                      )}

                      {errorInfo?.componentStack && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Component Stack:
                          </Typography>
                          <Typography
                            variant="body2"
                            component="pre"
                            sx={{
                              backgroundColor: 'grey.100',
                              p: 1,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              maxHeight: 150,
                              overflow: 'auto',
                            }}
                          >
                            {errorInfo.componentStack}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.state.errorInfo, this.handleRetry);
      }

      // Use default fallback
      return this.renderDefaultFallback();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
