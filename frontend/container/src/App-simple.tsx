import React, { useState } from 'react';
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
  Container,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  BugReport as BugReportIcon,
  ShoppingCart as ShoppingCartIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

// Simple working micro-frontend components
const UserManagementApp = () => (
  <Container>
    <Typography variant="h4" gutterBottom>User Management</Typography>
    <Typography>This is the User Management micro-frontend.</Typography>
    <Button variant="contained" sx={{ mt: 2 }}>Add User</Button>
  </Container>
);

const DataGridApp = () => (
  <Container>
    <Typography variant="h4" gutterBottom>Data Grid</Typography>
    <Typography>This is the Data Grid micro-frontend.</Typography>
    <Button variant="contained" sx={{ mt: 2 }}>Load Data</Button>
  </Container>
);

const AnalyticsApp = () => (
  <Container>
    <Typography variant="h4" gutterBottom>Analytics</Typography>
    <Typography>This is the Analytics micro-frontend.</Typography>
    <Button variant="contained" sx={{ mt: 2 }}>View Charts</Button>
  </Container>
);

const SettingsApp = () => (
  <Container>
    <Typography variant="h4" gutterBottom>Settings</Typography>
    <Typography>This is the Settings micro-frontend.</Typography>
    <Button variant="contained" sx={{ mt: 2 }}>Configure</Button>
  </Container>
);

const OrdersApp = () => (
  <Container>
    <Typography variant="h4" gutterBottom>Orders</Typography>
    <Typography>This is the Orders micro-frontend.</Typography>
    <Button variant="contained" sx={{ mt: 2 }}>View Orders</Button>
  </Container>
);

const CatalogApp = () => (
  <Container>
    <Typography variant="h4" gutterBottom>Catalog</Typography>
    <Typography>This is the Catalog micro-frontend.</Typography>
    <Button variant="contained" sx={{ mt: 2 }}>Browse Catalog</Button>
  </Container>
);

const ErrorMonitorApp = () => (
  <Container>
    <Typography variant="h4" gutterBottom>Error Monitor</Typography>
    <Typography>This is the Error Monitor micro-frontend.</Typography>
    <Button variant="contained" sx={{ mt: 2 }}>View Errors</Button>
  </Container>
);

const menuItems = [
  { id: 'home', label: 'Dashboard', icon: <HomeIcon />, component: null },
  { id: 'users', label: 'User Management', icon: <PeopleIcon />, component: <UserManagementApp /> },
  { id: 'data', label: 'Data Grid', icon: <DashboardIcon />, component: <DataGridApp /> },
  { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, component: <AnalyticsApp /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon />, component: <SettingsApp /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCartIcon />, component: <OrdersApp /> },
  { id: 'catalog', label: 'Catalog', icon: <CategoryIcon />, component: <CatalogApp /> },
  { id: 'error-monitor', label: 'Error Monitor', icon: <BugReportIcon />, component: <ErrorMonitorApp /> },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(true);

  console.log('🔄 App render - activeTab:', activeTab);

  const handleMenuClick = (tabId: string) => {
    console.log('🖱️  Menu clicked:', tabId);
    setActiveTab(tabId);
  };

  const renderContent = () => {
    console.log('🎨 Rendering content for tab:', activeTab);
    
    if (activeTab === 'home') {
      return (
        <Container>
          <Typography variant="h4" gutterBottom>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Welcome to the Micro-Frontend Platform. Click the menu items to navigate.
          </Typography>
          
          <Grid container spacing={3}>
            {menuItems.slice(1).map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {item.icon}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      onClick={() => handleMenuClick(item.id)}
                      fullWidth
                    >
                      Open {item.label}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      );
    }

    const activeItem = menuItems.find(item => item.id === activeTab);
    return activeItem?.component || <Typography>Content not found</Typography>;
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Header */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Micro-Frontend Platform - Simple Version
          </Typography>
          <Typography variant="body2">
            Active: {activeTab}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: 240,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            mt: 8,
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.id}
              selected={activeTab === item.id}
              onClick={() => handleMenuClick(item.id)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
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
          mt: 8,
          ml: drawerOpen ? '240px' : 0,
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
}

export default App;
