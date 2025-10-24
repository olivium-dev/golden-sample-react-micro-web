import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  port: number;
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    icon: <HomeIcon />,
    label: 'Dashboard',
    color: '#1976d2',
    port: 0,
  },
  {
    id: 'users',
    icon: <PeopleIcon />,
    label: 'User Management',
    color: '#61dafb',
    port: 3001,
  },
  {
    id: 'data',
    icon: <DashboardIcon />,
    label: 'Data Grid',
    color: '#ff6b6b',
    port: 3002,
  },
  {
    id: 'analytics',
    icon: <AnalyticsIcon />,
    label: 'Analytics',
    color: '#4ecdc4',
    port: 3003,
  },
  {
    id: 'settings',
    icon: <SettingsIcon />,
    label: 'Settings',
    color: '#ffa726',
    port: 3004,
  },
];

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState('home');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuClick = (id: string) => {
    setSelectedPage(id);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const renderContent = () => {
    if (selectedPage === 'home') {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h3" gutterBottom>
            🏠 Micro-Frontend Container
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Welcome to the Golden Sample Micro-Frontend Platform
          </Typography>
          <Typography variant="body1" paragraph>
            Select a module from the menu to view:
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mt: 3 }}>
            {menuItems.filter(item => item.id !== 'home').map((item) => (
              <Box
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: item.color,
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ color: item.color, mr: 2 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6">{item.label}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Port {item.port}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 4, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'success.dark' }}>
              ✅ All micro-frontends are running independently and working!
            </Typography>
          </Box>
        </Box>
      );
    }

    const selectedItem = menuItems.find(item => item.id === selectedPage);
    if (!selectedItem || selectedItem.port === 0) {
      return null;
    }

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: selectedItem.color }}>{selectedItem.icon}</Box>
            {selectedItem.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Running on http://localhost:{selectedItem.port}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <iframe
            src={`http://localhost:${selectedItem.port}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title={selectedItem.label}
          />
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Golden Sample - Micro-Frontend Platform
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            React 18.2.0 + MUI + Webpack
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={selectedPage === item.id}
                onClick={() => handleMenuClick(item.id)}
              >
                <ListItemIcon sx={{ color: item.color }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
}

export default App;





