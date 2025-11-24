import React, { useState, lazy, Suspense } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  CircularProgress,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CssBaseline,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  TableChart as DataGridIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ShoppingCart as OrdersIcon,
  Category as CatalogIcon,
  BugReport as ErrorIcon,
} from '@mui/icons-material';

// Lazy load micro-frontends
const UserManagement = lazy(() => import('userApp/UserManagement'));
const DataGrid = lazy(() => import('dataApp/DataGrid'));
const Analytics = lazy(() => import('analyticsApp/Analytics'));
const Settings = lazy(() => import('settingsApp/Settings'));
const Orders = lazy(() => import('ordersApp/Orders'));
const Catalog = lazy(() => import('catalogApp/Catalog'));

// Error Monitor component
const ErrorMonitor = () => (
  <Container>
    <Typography variant="h4" gutterBottom>Error Monitor</Typography>
    <Typography>Error monitoring functionality</Typography>
  </Container>
);

// Menu items configuration
const menuItems = [
  { id: 'home', label: 'Dashboard', icon: <HomeIcon />, color: '#61dafb' },
  { id: 'users', label: 'User Management', icon: <PeopleIcon />, color: '#4caf50' },
  { id: 'orders', label: 'Orders', icon: <OrdersIcon />, color: '#00bcd4' },
  { id: 'catalog', label: 'Catalog', icon: <CatalogIcon />, color: '#795548' },
  // Hidden menu items - analytics, data grid, settings, error monitor
  // { id: 'data', label: 'Data Grid', icon: <DataGridIcon />, color: '#ff9800' },
  // { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, color: '#9c27b0' },
  // { id: 'settings', label: 'Settings', icon: <SettingsIcon />, color: '#f44336' },
  // { id: 'error-monitor', label: 'Error Monitor', icon: <ErrorIcon />, color: '#607d8b' },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const drawerWidth = 260;

  const handleMenuClick = (tabId: string) => {
    console.log(`Navigating to: ${tabId}`);
    setActiveTab(tabId);
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Welcome to the Micro-Frontend Platform. Select a module to get started.
          </Typography>
          
          <Grid container spacing={3}>
            {menuItems.slice(1).map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ 
                  height: '100%',
                  border: `2px solid ${item.color}`,
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s',
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ fontSize: '3rem', color: item.color, mb: 2 }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h5" sx={{ color: item.color }}>
                      {item.label}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center' }}>
                    <Button 
                      variant="contained"
                      onClick={() => handleMenuClick(item.id)}
                      sx={{ 
                        backgroundColor: item.color,
                        '&:hover': { backgroundColor: item.color, opacity: 0.9 }
                      }}
                    >
                      Open Module
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      );
    }

    // Render micro-frontends
    const LoadingFallback = (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );

    const ErrorFallback = () => (
      <Container>
        <Typography variant="h6" color="error">
          Failed to load micro-frontend
        </Typography>
        <Button onClick={() => setActiveTab('home')} sx={{ mt: 2 }}>
          Return to Dashboard
        </Button>
      </Container>
    );

    return (
      <Suspense fallback={LoadingFallback}>
        {(() => {
          try {
            switch (activeTab) {
              case 'users':
                return <UserManagement />;
              case 'data':
                return <DataGrid />;
              case 'analytics':
                return <Analytics />;
              case 'settings':
                return <Settings />;
              case 'orders':
                return <Orders />;
              case 'catalog':
                return <Catalog />;
              case 'error-monitor':
                return <ErrorMonitor />;
              default:
                return <Typography>Module not found</Typography>;
            }
          } catch (error) {
            console.error('Failed to load module:', error);
            return <ErrorFallback />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* Header */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              Micro-Frontend Platform
            </Typography>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>A</Avatar>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Drawer
          variant="persistent"
          open={drawerOpen}
          sx={{
            width: drawerOpen ? drawerWidth : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeTab === item.id}
                onClick={() => handleMenuClick(item.id)}
              >
                <ListItemIcon sx={{ color: item.color }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)`,
            ml: drawerOpen ? 0 : 0,
            mt: 8,
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </>
  );
}

export default App;
