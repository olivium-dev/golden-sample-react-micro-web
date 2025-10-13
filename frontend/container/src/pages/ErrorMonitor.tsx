import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress,
  Paper,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  BugReport as BugReportIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Apps as AppsIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useErrorMonitor, ErrorEntry, ErrorType } from '../../../shared-ui-lib/src';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

interface ErrorStats {
  total: number;
  by_type: Record<string, number>;
  by_app: Record<string, number>;
  by_severity: Record<string, number>;
  recent: number;
  resolved: number;
  unresolved: number;
}

const ErrorMonitor: React.FC = () => {
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
  } = useErrorMonitor(undefined, true, 3000); // Auto-refresh every 3 seconds

  const [backendStats, setBackendStats] = useState<ErrorStats | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1h');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // Fetch backend error stats
  const fetchBackendStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/errors/stats`);
      setBackendStats(response.data);
    } catch (error) {
      console.error('Failed to fetch backend error stats:', error);
    }
  };

  useEffect(() => {
    fetchBackendStats();
    const interval = setInterval(fetchBackendStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Update filters
  useEffect(() => {
    const now = Date.now();
    const timeRanges = {
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    };

    const newFilter = {
      ...(selectedType !== 'all' && { type: selectedType as ErrorType }),
      ...(selectedApp !== 'all' && { appName: selectedApp }),
      ...(selectedSeverity !== 'all' && { severity: selectedSeverity as ErrorEntry['severity'] }),
      ...(selectedTimeRange !== 'all' && {
        timeRange: {
          start: now - timeRanges[selectedTimeRange as keyof typeof timeRanges],
          end: now,
        },
      }),
    };

    setFilter(Object.keys(newFilter).length > 0 ? newFilter : undefined);
  }, [selectedType, selectedApp, selectedSeverity, selectedTimeRange, setFilter]);

  const getSeverityIcon = (severity: ErrorEntry['severity']) => {
    switch (severity) {
      case 'critical': return <ErrorIcon color="error" />;
      case 'high': return <WarningIcon color="warning" />;
      case 'medium': return <InfoIcon color="info" />;
      case 'low': return <BugReportIcon color="action" />;
      default: return <BugReportIcon />;
    }
  };

  const getSeverityColor = (severity: ErrorEntry['severity']) => {
    switch (severity) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#757575';
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

  // Prepare chart data
  const errorTimelineData = React.useMemo(() => {
    const last24Hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - (23 - i), 0, 0, 0);
      return {
        time: hour.toLocaleTimeString([], { hour: '2-digit' }),
        timestamp: hour.getTime(),
        errors: 0,
      };
    });

    errors.forEach((error: ErrorEntry) => {
      const errorHour = new Date(error.timestamp);
      errorHour.setMinutes(0, 0, 0);
      const dataPoint = last24Hours.find(d => d.timestamp === errorHour.getTime());
      if (dataPoint) {
        dataPoint.errors++;
      }
    });

    return last24Hours;
  }, [errors]);

  const errorTypeData = React.useMemo(() => {
    return Object.entries(stats.byType).map(([type, count]) => ({
      name: type,
      value: count,
      color: getTypeColor(type as ErrorType),
    }));
  }, [stats.byType]);

  const errorAppData = React.useMemo(() => {
    return Object.entries(stats.byApp).map(([app, count]) => ({
      name: app,
      value: count,
    }));
  }, [stats.byApp]);

  const handleExport = () => {
    const data = exportErrors();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const uniqueApps = Array.from(new Set(errors.map(e => e.appName)));

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <BugReportIcon color="error" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Error Monitoring Dashboard
          </Typography>
          <Badge badgeContent={stats.total} color="error" max={999}>
            <Chip label="Live" color="success" variant="outlined" />
          </Badge>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Real-time error monitoring and analysis across all micro-frontends
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => {
              refreshErrors();
              fetchBackendStats();
            }}
            disabled={isLoading}
          >
            Refresh
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={clearErrors}
            color="warning"
            disabled={stats.total === 0}
          >
            Clear All
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={stats.total === 0}
          >
            Export Report
          </Button>

          <Divider orientation="vertical" flexItem />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={selectedTimeRange}
              label="Time Range"
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <MenuItem value="15m">Last 15 min</MenuItem>
              <MenuItem value="1h">Last 1 hour</MenuItem>
              <MenuItem value="6h">Last 6 hours</MenuItem>
              <MenuItem value="24h">Last 24 hours</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="all">All time</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedType}
              label="Type"
              onChange={(e) => setSelectedType(e.target.value)}
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
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <MenuItem value="all">All Severities</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <BugReportIcon color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="error">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Errors
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TrendingUpIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {stats.recent}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recent (5 min)
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AppsIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="info.main">
                    {Object.keys(stats.byApp).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Affected Apps
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TimelineIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {backendStats?.resolved || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resolved
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Error Timeline (Last 24 Hours)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={errorTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="errors" stroke="#f44336" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Errors by Type
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={errorTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={(props: any) => `${props.name}: ${props.value}`}
                    >
                      {errorTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Errors by Application
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={errorAppData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#2196f3" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Error Details ({errors.length} errors)
          </Typography>
          
          {errors.length === 0 ? (
            <Alert severity="success">
              No errors found for the selected filters! 🎉
            </Alert>
          ) : (
            <List>
              {errors.map((error: ErrorEntry) => (
                <ListItem key={error.id} sx={{ px: 0 }}>
                  <Box sx={{ width: '100%' }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 1 }}>
                          {getSeverityIcon(error.severity)}
                          <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
                            <Typography variant="body1" noWrap>
                              {error.message}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Chip
                                label={error.type}
                                size="small"
                                sx={{
                                  backgroundColor: getTypeColor(error.type),
                                  color: 'white',
                                  fontSize: '0.75rem',
                                }}
                              />
                              <Chip
                                label={error.appName}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                              <Chip
                                label={error.severity}
                                size="small"
                                sx={{
                                  backgroundColor: getSeverityColor(error.severity),
                                  color: 'white',
                                  fontSize: '0.75rem',
                                }}
                              />
                              <Chip
                                label={formatTimestamp(error.timestamp)}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
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
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <Typography variant="caption" color="text.secondary">
                            Error ID: {error.id} • URL: {error.url}
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
                                  p: 2,
                                  borderRadius: 1,
                                  fontSize: '0.8rem',
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
        </CardContent>
      </Card>
    </Container>
  );
};

export default ErrorMonitor;
