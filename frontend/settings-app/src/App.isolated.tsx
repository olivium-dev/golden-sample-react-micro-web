import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Chip,
  Alert,
  Paper
} from '@mui/material';
import {
  Settings,
  Palette,
  Language,
  Notifications,
  Security
} from '@mui/icons-material';
import { useSettingsConfig } from './config/index';

function App() {
  const config = useSettingsConfig();
  const [settings, setSettings] = useState(config.mock?.mockSettings || {
    theme_mode: 'light',
    primary_color: '#1976d2',
    language: 'en',
    notifications_enabled: true,
    email_notifications: true,
    push_notifications: false,
    auto_save: true,
    compact_mode: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // Simulate save
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings(mockSettings);
    setSaved(false);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          ⚙️ Settings Panel
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

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Palette sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6">Appearance</Typography>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Theme Mode</InputLabel>
                <Select
                  value={settings.theme_mode}
                  label="Theme Mode"
                  onChange={(e) => handleSettingChange('theme_mode', e.target.value)}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Primary Color</InputLabel>
                <Select
                  value={settings.primary_color}
                  label="Primary Color"
                  onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                >
                  <MenuItem value="#1976d2">Blue</MenuItem>
                  <MenuItem value="#d32f2f">Red</MenuItem>
                  <MenuItem value="#388e3c">Green</MenuItem>
                  <MenuItem value="#f57c00">Orange</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.compact_mode}
                    onChange={(e) => handleSettingChange('compact_mode', e.target.checked)}
                  />
                }
                label="Compact Mode"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Notifications sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6">Notifications</Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications_enabled}
                    onChange={(e) => handleSettingChange('notifications_enabled', e.target.checked)}
                  />
                }
                label="Enable Notifications"
                sx={{ mb: 2, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.email_notifications}
                    onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                    disabled={!settings.notifications_enabled}
                  />
                }
                label="Email Notifications"
                sx={{ mb: 2, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.push_notifications}
                    onChange={(e) => handleSettingChange('push_notifications', e.target.checked)}
                    disabled={!settings.notifications_enabled}
                  />
                }
                label="Push Notifications"
                sx={{ mb: 2, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.auto_save}
                    onChange={(e) => handleSettingChange('auto_save', e.target.checked)}
                  />
                }
                label="Auto Save"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Language & Region */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Language sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6">Language & Region</Typography>
              </Box>
              
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  label="Language"
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Settings Display */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Settings sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6">Current Configuration</Typography>
              </Box>
              
              <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem' }}>
                  {JSON.stringify(settings, null, 2)}
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          onClick={handleSave}
          sx={{ minWidth: 120 }}
        >
          Save Settings
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleReset}
          sx={{ minWidth: 120 }}
        >
          Reset to Defaults
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          🎉 Settings Panel - Standalone Mode Working!
        </Typography>
      </Box>
    </Box>
  );
}

export default App;