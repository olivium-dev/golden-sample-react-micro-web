import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
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

interface Settings {
  id: number;
  theme_mode: string;
  primary_color: string;
  secondary_color: string;
  language: string;
  timezone: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  auto_save: boolean;
  compact_mode: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/settings`);
      setSettings(response.data);
    } catch (error) {
      showSnackbar('Error fetching settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      await axios.put(`${API_BASE_URL}/settings`, settings);
      showSnackbar('Settings saved successfully', 'success');
    } catch (error) {
      showSnackbar('Error saving settings', 'error');
    }
  };

  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      try {
        const response = await axios.post(`${API_BASE_URL}/settings/reset`);
        setSettings(response.data);
        showSnackbar('Settings reset to defaults', 'success');
      } catch (error) {
        showSnackbar('Error resetting settings', 'error');
      }
    }
  };

  const handleUpdateSetting = (key: keyof Settings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading || !settings) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography>Loading settings...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#ffa726' }}>
            ⚙️ Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            System configuration and preferences
          </Typography>
        </Box>

        <Paper>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Appearance" />
            <Tab label="Notifications" />
            <Tab label="General" />
          </Tabs>

          {/* Appearance Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Theme Mode
                    </Typography>
                    <ToggleButtonGroup
                      value={settings.theme_mode}
                      exclusive
                      onChange={(e, newMode) => {
                        if (newMode) handleUpdateSetting('theme_mode', newMode);
                      }}
                      fullWidth
                    >
                      <ToggleButton value="light">
                        <LightModeIcon sx={{ mr: 1 }} />
                        Light
                      </ToggleButton>
                      <ToggleButton value="dark">
                        <DarkModeIcon sx={{ mr: 1 }} />
                        Dark
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Primary Color
                    </Typography>
                    <TextField
                      fullWidth
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) =>
                        handleUpdateSetting('primary_color', e.target.value)
                      }
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Main accent color used throughout the application
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Secondary Color
                    </Typography>
                    <TextField
                      fullWidth
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) =>
                        handleUpdateSetting('secondary_color', e.target.value)
                      }
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Secondary accent color for highlights and CTAs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.compact_mode}
                          onChange={(e) =>
                            handleUpdateSetting('compact_mode', e.target.checked)
                          }
                        />
                      }
                      label="Compact Mode"
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Reduce spacing and padding for a more dense interface
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={1}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Notification Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications_enabled}
                        onChange={(e) =>
                          handleUpdateSetting('notifications_enabled', e.target.checked)
                        }
                      />
                    }
                    label="Enable Notifications"
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.email_notifications}
                        onChange={(e) =>
                          handleUpdateSetting('email_notifications', e.target.checked)
                        }
                        disabled={!settings.notifications_enabled}
                      />
                    }
                    label="Email Notifications"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Receive notifications via email
                  </Typography>
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.push_notifications}
                        onChange={(e) =>
                          handleUpdateSetting('push_notifications', e.target.checked)
                        }
                        disabled={!settings.notifications_enabled}
                      />
                    }
                    label="Push Notifications"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Receive browser push notifications
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          </TabPanel>

          {/* General Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  label="Language"
                  onChange={(e) => handleUpdateSetting('language', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="ar">Arabic</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.timezone}
                  label="Timezone"
                  onChange={(e) => handleUpdateSetting('timezone', e.target.value)}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">Eastern Time</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                  <MenuItem value="Europe/London">London</MenuItem>
                  <MenuItem value="Asia/Dubai">Dubai</MenuItem>
                  <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                </Select>
              </FormControl>

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.auto_save}
                    onChange={(e) =>
                      handleUpdateSetting('auto_save', e.target.checked)
                    }
                  />
                }
                label="Auto Save"
              />
              <Typography variant="caption" color="text.secondary">
                Automatically save changes without confirmation
              </Typography>
            </Box>
          </TabPanel>

          {/* Action Buttons */}
          <Box sx={{ p: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={handleResetSettings}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              sx={{
                backgroundColor: '#ffa726',
                '&:hover': { backgroundColor: '#ff9800' },
              }}
            >
              Save Settings
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
