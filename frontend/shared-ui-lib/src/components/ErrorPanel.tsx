import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Button,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Badge,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { ErrorPanelProps, ErrorEntry, ErrorType } from '../errors/types';
import { useErrorMonitor } from '../hooks/useErrorMonitor';

const ErrorPanel: React.FC<ErrorPanelProps> = ({ 
  isOpen, 
  onClose, 
  maxHeight = 600 
}) => {
  const {
    errors,
    stats,
    isLoading,
    clearErrors,
    removeError,
    refreshErrors,
    exportErrors,
    setFilter,
    filter,
  } = useErrorMonitor();

  const [selectedType, setSelectedType] = useState<ErrorType | 'all'>('all');
  const [selectedApp, setSelectedApp] = useState<string | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<ErrorEntry['severity'] | 'all'>('all');

  const handleFilterChange = () => {
    const newFilter = {
      ...(selectedType !== 'all' && { type: selectedType }),
      ...(selectedApp !== 'all' && { appName: selectedApp }),
      ...(selectedSeverity !== 'all' && { severity: selectedSeverity }),
    };

    setFilter(Object.keys(newFilter).length > 0 ? newFilter : undefined);
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [selectedType, selectedApp, selectedSeverity]);

  const handleExport = () => {
    const data = exportErrors();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errors-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityIcon = (severity: ErrorEntry['severity']) => {
    switch (severity) {
      case 'critical': return <ErrorIcon color="error" />;
      case 'high': return <WarningIcon color="warning" />;
      case 'medium': return <InfoIcon color="info" />;
      case 'low': return <BugIcon color="action" />;
      default: return <BugIcon />;
    }
  };

  const getSeverityColor = (severity: ErrorEntry['severity']) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTypeColor = (type: ErrorType) => {
    switch (type) {
      case 'react': return '#f44336';
      case 'api': return '#ff9800';
      case 'network': return '#2196f3';
      case 'moduleFederation': return '#9c27b0';
      case 'unknown': return '#757575';
      default: return '#757575';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const uniqueApps = Array.from(new Set(errors.map(e => e.appName)));

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 500, md: 600 },
          maxHeight: maxHeight,
        },
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BugIcon color="error" />
            <Typography variant="h6">
              Error Monitor
            </Typography>
            <Badge badgeContent={stats.total} color="error" max={99}>
              <Box />
            </Badge>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Stats */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip 
              label={`Total: ${stats.total}`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`Recent: ${stats.recent}`} 
              size="small" 
              color={stats.recent > 0 ? 'error' : 'default'}
              variant="outlined" 
            />
            {Object.entries(stats.byType).map(([type, count]) => (
              count > 0 && (
                <Chip
                  key={type}
                  label={`${type}: ${count}`}
                  size="small"
                  sx={{ 
                    backgroundColor: getTypeColor(type as ErrorType),
                    color: 'white',
                  }}
                />
              )
            ))}
          </Stack>
        </Box>

        {/* Controls */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={refreshErrors}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearErrors}
              color="warning"
              disabled={stats.total === 0}
            >
              Clear All
            </Button>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={stats.total === 0}
            >
              Export
            </Button>
          </Stack>

          {/* Filters */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={selectedType}
                label="Type"
                onChange={(e) => setSelectedType(e.target.value as ErrorType | 'all')}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="react">React</MenuItem>
                <MenuItem value="api">API</MenuItem>
                <MenuItem value="network">Network</MenuItem>
                <MenuItem value="moduleFederation">Module Federation</MenuItem>
                <MenuItem value="unknown">Unknown</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>App</InputLabel>
              <Select
                value={selectedApp}
                label="App"
                onChange={(e) => setSelectedApp(e.target.value)}
              >
                <MenuItem value="all">All Apps</MenuItem>
                {uniqueApps.map(app => (
                  <MenuItem key={app} value={app}>{app}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={selectedSeverity}
                label="Severity"
                onChange={(e) => setSelectedSeverity(e.target.value as ErrorEntry['severity'] | 'all')}
              >
                <MenuItem value="all">All Severities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Error List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {errors.length === 0 ? (
            <Alert severity="success">
              No errors found! 🎉
            </Alert>
          ) : (
            <List dense>
              {errors.map((error) => (
                <ListItem key={error.id} sx={{ px: 0 }}>
                  <Box sx={{ width: '100%' }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 1 }}>
                          {getSeverityIcon(error.severity)}
                          <Box sx={{ ml: 1, flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {error.message}
                            </Typography>
                            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                              <Chip
                                label={error.type}
                                size="small"
                                sx={{
                                  backgroundColor: getTypeColor(error.type),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  height: 18,
                                }}
                              />
                              <Chip
                                label={error.appName}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 18 }}
                              />
                              <Chip
                                label={error.severity}
                                size="small"
                                color={getSeverityColor(error.severity) as any}
                                sx={{ fontSize: '0.7rem', height: 18 }}
                              />
                            </Stack>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeError(error.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(error.timestamp)} • ID: {error.id}
                          </Typography>
                          
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
                                  fontSize: '0.7rem',
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  maxHeight: 150,
                                  overflow: 'auto',
                                }}
                              >
                                {error.stack}
                              </Typography>
                            </Box>
                          )}

                          <Button
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(error, null, 2));
                            }}
                          >
                            Copy Error Details
                          </Button>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default ErrorPanel;
