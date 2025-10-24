import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  Schedule,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Auto-login and token refresh
const autoLogin = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "admin@example.com",
      password: "admin123"
    });
    const token = response.data.access_token;
    localStorage.setItem('access_token', token);
    return token;
  } catch (error) {
    console.error('Auto-login failed:', error);
    return null;
  }
};

// Add auth token to requests with auto-refresh
axios.interceptors.request.use(async (config) => {
  // Skip auth for login requests to prevent loops
  if (config.url?.includes('/auth/login')) {
    return config;
  }
  
  let token = localStorage.getItem('access_token');
  if (!token) {
    token = await autoLogin();
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors with auto-refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Skip retry for login requests to prevent loops
    if (error.config?.url?.includes('/auth/login') || error.config?._retry) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      error.config._retry = true; // Mark as retried
      const token = await autoLogin();
      if (token) {
        error.config.headers.Authorization = `Bearer ${token}`;
        return axios.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

interface MetricCard {
  title: string;
  value: string;
  change: number;
  trend: string;
  icon: string;
}

interface AnalyticsData {
  metrics: MetricCard[];
  lineChart: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
  barChart: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
    }>;
  };
  pieChart: {
    labels: string[];
    data: number[];
  };
}

const COLORS = ['#61dafb', '#ff6b6b', '#4ecdc4', '#ffa726', '#9c27b0'];

function App() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics`);
      setAnalyticsData(response.data);
    } catch (err) {
      setError('Error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'AttachMoney':
        return <AttachMoney sx={{ fontSize: 40 }} />;
      case 'People':
        return <People sx={{ fontSize: 40 }} />;
      case 'TrendingUp':
        return <TrendingUp sx={{ fontSize: 40 }} />;
      case 'Schedule':
        return <Schedule sx={{ fontSize: 40 }} />;
      default:
        return <TrendingUp sx={{ fontSize: 40 }} />;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !analyticsData) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">{error || 'No data available'}</Alert>
        </Box>
      </Container>
    );
  }

  // Transform data for Recharts
  const lineChartData = analyticsData.lineChart.labels.map((label, index) => ({
    name: label,
    ...Object.fromEntries(
      analyticsData.lineChart.datasets.map((dataset) => [
        dataset.label,
        dataset.data[index],
      ])
    ),
  }));

  const barChartData = analyticsData.barChart.labels.map((label, index) => ({
    name: label,
    ...Object.fromEntries(
      analyticsData.barChart.datasets.map((dataset) => [
        dataset.label,
        dataset.data[index],
      ])
    ),
  }));

  const pieChartData = analyticsData.pieChart.labels.map((label, index) => ({
    name: label,
    value: analyticsData.pieChart.data[index],
  }));

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#4ecdc4' }}>
            📈 Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time analytics and reporting
          </Typography>
        </Box>

        {/* Metric Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {analyticsData.metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {metric.title}
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                        {metric.value}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {metric.trend === 'up' ? (
                          <TrendingUp sx={{ color: '#4caf50', fontSize: 20 }} />
                        ) : (
                          <TrendingDown sx={{ color: '#f44336', fontSize: 20 }} />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            color: metric.trend === 'up' ? '#4caf50' : '#f44336',
                            ml: 0.5,
                          }}
                        >
                          {Math.abs(metric.change)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ color: '#4ecdc4' }}>{getIcon(metric.icon)}</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Line Chart */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Revenue vs Expenses Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {analyticsData.lineChart.datasets.map((dataset, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={dataset.label}
                  stroke={dataset.borderColor}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Grid container spacing={3}>
          {/* Bar Chart */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Department Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {analyticsData.barChart.datasets.map((dataset, index) => (
                    <Bar
                      key={index}
                      dataKey={dataset.label}
                      fill={dataset.backgroundColor}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Traffic Sources
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default App;
