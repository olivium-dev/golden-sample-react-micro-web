import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Chip,
  Stack,
  Box,
} from '@mui/material';
import {
  Close as CloseIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';
import { ErrorToastProps } from '../errors/types';

const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onDismiss,
  autoHideDuration = 6000,
}) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onDismiss(error.id);
  };

  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(handleClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration]);

  const getSeverityLevel = () => {
    switch (error.severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const getTypeColor = () => {
    switch (error.type) {
      case 'react': return '#f44336';
      case 'api': return '#ff9800';
      case 'network': return '#2196f3';
      case 'moduleFederation': return '#9c27b0';
      case 'unknown': return '#757575';
      default: return '#757575';
    }
  };

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 8 }} // Account for app bar
    >
      <Alert
        severity={getSeverityLevel() as any}
        onClose={handleClose}
        sx={{
          minWidth: 350,
          maxWidth: 500,
        }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <AlertTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BugIcon fontSize="small" />
            <span>Error in {error.appName}</span>
          </Stack>
        </AlertTitle>
        
        <Box sx={{ mb: 1 }}>
          {error.message.length > 100 
            ? `${error.message.substring(0, 100)}...`
            : error.message
          }
        </Box>

        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <Chip
            label={error.type}
            size="small"
            sx={{
              backgroundColor: getTypeColor(),
              color: 'white',
              fontSize: '0.7rem',
              height: 20,
            }}
          />
          <Chip
            label={error.severity}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
          <Chip
            label={new Date(error.timestamp).toLocaleTimeString()}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        </Stack>
      </Alert>
    </Snackbar>
  );
};

export default ErrorToast;
