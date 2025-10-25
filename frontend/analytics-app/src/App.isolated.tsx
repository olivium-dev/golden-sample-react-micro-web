import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assessment,
  Timeline
} from '@mui/icons-material';
import { useAnalyticsConfig } from './config/index';

function App() {
  const config = useAnalyticsConfig();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use mock data from config or simulate API call
    if (config.mock?.enabled && config.mock?.mockMetrics) {
      setTimeout(() => {
        setAnalyticsData(config.mock.mockMetrics);
        setLoading(false);
      }, config.mock.apiDelay);
    } else {
      // In real mode, would fetch from API
      setTimeout(() => {
        setAnalyticsData(config.mock?.mockMetrics);
        setLoading(false);
      }, 1000);
    }
  }, [config]);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'People': return <People />;
      case 'TrendingUp': return <TrendingUp />;
      case 'Assessment': return <Assessment />;
      case 'Timeline': return <Timeline />;
      default: return <Assessment />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading analytics: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          📊 Analytics Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ✅ Micro-Frontend Architecture is Working!
        </Typography>
        <Chip 
          label="Standalone Mode" 
          color="success" 
          variant="outlined" 
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {analyticsData?.metrics?.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: '#1976d2', mr: 1 }}>
                    {getIcon(metric.icon)}
                  </Box>
                  <Typography variant="h6" component="div">
                    {metric.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {metric.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                    color={metric.change > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Chart Placeholder */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 Performance Chart
          </Typography>
          <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#f9f9f9' }}>
            <Typography variant="body1" color="text.secondary">
              Chart visualization would go here
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Data: {JSON.stringify(analyticsData?.chartData)}
            </Typography>
          </Paper>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          🎉 Analytics Dashboard - Standalone Mode Working!
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => window.location.reload()} 
          sx={{ mt: 2 }}
        >
          Refresh Data
        </Button>
      </Box>
    </Box>
  );
}

export default App;