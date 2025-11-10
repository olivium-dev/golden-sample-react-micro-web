import React, { useState, Suspense, useEffect } from 'react';
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
  Avatar,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Chip,
  useMediaQuery,
  useTheme,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  BugReport as BugReportIcon,
  ShoppingCart as ShoppingCartIcon,
  Category as CategoryIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { 
  ErrorBoundary, 
  ErrorPanel, 
  ErrorToast, 
  useErrorMonitor,
  ErrorCapture,
  authService,
} from '../../shared-ui-lib/src';
import ErrorMonitor from './pages/ErrorMonitor';
import LoginScreen from './components/LoginScreen';

// Lazy load remote micro-frontends
const UserManagement = React.lazy(() => import('userApp/UserManagement'));
const DataGrid = React.lazy(() => import('dataApp/DataGrid'));
const Analytics = React.lazy(() => import('analyticsApp/Analytics'));
const Settings = React.lazy(() => import('settingsApp/Settings'));
const Orders = React.lazy(() => import('ordersApp/Orders'));
const Catalog = React.lazy(() => import('catalogApp/Catalog'));

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    icon: <HomeIcon />,
    label: 'Dashboard',
    color: '#61dafb',
    description: 'Overview and quick access to all modules',
  },
  {
    id: 'users',
    icon: <PeopleIcon />,
    label: 'User Management',
    color: '#61dafb',
    description: 'Manage users, roles, and permissions',
  },
  {
    id: 'data',
    icon: <DashboardIcon />,
    label: 'Data Grid',
    color: '#ff6b6b',
    description: 'View and manage data with advanced filtering',
  },
  {
    id: 'analytics',
    icon: <AnalyticsIcon />,
    label: 'Analytics',
    color: '#4ecdc4',
    description: 'Real-time analytics and reporting',
  },
  {
    id: 'settings',
    icon: <SettingsIcon />,
    label: 'Settings',
    color: '#ffa726',
    description: 'System configuration and preferences',
  },
  {
    id: 'orders',
    icon: <ShoppingCartIcon />,
    label: 'Orders',
    color: '#9c27b0',
    description: 'Manage orders and order processing',
  },
  {
    id: 'catalog',
    icon: <CategoryIcon />,
    label: 'Catalog',
    color: '#00bcd4',
    description: 'Manage catalog items and categories',
  },
  {
    id: 'error-monitor',
    icon: <BugReportIcon />,
    label: 'Error Monitor',
    color: '#f44336',
    description: 'Real-time error monitoring and analysis',
  },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [errorPanelOpen, setErrorPanelOpen] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Error monitoring
  const { errors, stats, clearErrors } = useErrorMonitor();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  // Handle login with Firebase Email/Password
  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setLoginError(null);
    try {
      console.log('🔐 Attempting Firebase Email/Password login...');
      await authService.loginWithEmailPassword(email, password);
      console.log('✅ Firebase login successful');
      setIsAuthenticated(true);
      setAuthLoading(false);
    } catch (error: any) {
      console.error('❌ Firebase login failed:', error);
      setLoginError(error.message || 'Login failed');
      setAuthLoading(false);
      throw error;
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  React.useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  // Keyboard shortcuts for error panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
        switch (event.key) {
          case 'E':
            event.preventDefault();
            setErrorPanelOpen(!errorPanelOpen);
            break;
          case 'C':
            event.preventDefault();
            clearErrors();
            break;
          case 'M':
            event.preventDefault();
            setActiveTab('error-monitor');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [errorPanelOpen, clearErrors]);

  // Show toast for new errors
  useEffect(() => {
    if (errors.length > 0) {
      const latestError = errors[0];
      const fiveSecondsAgo = Date.now() - 5000;
      
      if (latestError.timestamp > fiveSecondsAgo && latestError.id !== showErrorToast) {
        setShowErrorToast(latestError.id);
      }
    }
  }, [errors, showErrorToast]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuItemClick = (tabId: string) => {
    console.log(`🔄 Navigating to: ${tabId}`);
    setActiveTab(tabId);
    if (isMobile) {
      setDrawerOpen(false);
    }
    // Scroll to top when changing tabs
    window.scrollTo(0, 0);
    // Force re-render
    setTimeout(() => {
      console.log(`✅ Navigation complete to: ${tabId}`);
    }, 100);
  };

  const renderRemoteApp = () => {
    const LoadingFallback = (
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

    const ErrorFallback = (error: Error, errorInfo: React.ErrorInfo, retry: () => void) => (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Module Federation Error
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Error: {error.message}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'monospace' }}>
          Stack: {error.stack?.substring(0, 200)}...
        </Typography>
        <Button variant="contained" onClick={retry}>
          Retry Loading
        </Button>
      </Box>
    );

    const SuspenseFallback = (
      <Suspense 
        fallback={
          <Box sx={{ p: 3 }}>
            {LoadingFallback}
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
              Loading micro-frontend...
            </Typography>
          </Box>
        }
      >
        {(() => {
          try {
            switch (activeTab) {
              case 'users':
                return (
                  <ErrorBoundary 
                    componentName="User Management App" 
                    fallback={ErrorFallback}
                    onError={(error: Error, errorInfo: React.ErrorInfo) => {
                      ErrorCapture.captureModuleFederationError('userApp/UserManagement', error);
                    }}
                  >
                    <UserManagement />
                  </ErrorBoundary>
                );
              case 'data':
                return (
                  <ErrorBoundary 
                    componentName="Data Grid App" 
                    fallback={ErrorFallback}
                    onError={(error: Error, errorInfo: React.ErrorInfo) => {
                      ErrorCapture.captureModuleFederationError('dataApp/DataGrid', error);
                    }}
                  >
                    <DataGrid />
                  </ErrorBoundary>
                );
              case 'analytics':
                return (
                  <ErrorBoundary 
                    componentName="Analytics App" 
                    fallback={ErrorFallback}
                    onError={(error: Error, errorInfo: React.ErrorInfo) => {
                      ErrorCapture.captureModuleFederationError('analyticsApp/Analytics', error);
                    }}
                  >
                    <Analytics />
                  </ErrorBoundary>
                );
              case 'settings':
                return (
                  <ErrorBoundary 
                    componentName="Settings App" 
                    fallback={ErrorFallback}
                    onError={(error: Error, errorInfo: React.ErrorInfo) => {
                      ErrorCapture.captureModuleFederationError('settingsApp/Settings', error);
                    }}
                  >
                    <Settings />
                  </ErrorBoundary>
                );
              case 'orders':
                return (
                  <ErrorBoundary 
                    componentName="Orders App" 
                    fallback={ErrorFallback}
                    onError={(error: Error, errorInfo: React.ErrorInfo) => {
                      ErrorCapture.captureModuleFederationError('ordersApp/Orders', error);
                    }}
                  >
                    <Orders />
                  </ErrorBoundary>
                );
              case 'catalog':
                return (
                  <ErrorBoundary 
                    componentName="Catalog App" 
                    fallback={ErrorFallback}
                    onError={(error: Error, errorInfo: React.ErrorInfo) => {
                      ErrorCapture.captureModuleFederationError('catalogApp/Catalog', error);
                    }}
                  >
                    <Catalog />
                  </ErrorBoundary>
                );
              default:
                return null;
            }
          } catch (error) {
            ErrorCapture.captureModuleFederationError(activeTab, error);
            return ErrorFallback(error as Error, {}, () => window.location.reload());
          }
        })()}
      </Suspense>
    );

    return SuspenseFallback;
  };

  const drawerWidth = 260;

  // Show login screen if not authenticated
  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} loading={authLoading} error={loginError} />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#282c34',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: '#61dafb' }}
          >
            <MenuIcon />
          </IconButton>
          <HomeIcon sx={{ mr: 1, color: '#61dafb' }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, color: '#61dafb' }}
          >
            Micro-Frontend Platform
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, color: '#cccccc' }}>
            Welcome, Admin
          </Typography>
          <IconButton onClick={handleLogout} sx={{ color: 'white', mr: 1 }} title="Logout">
            <LogoutIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: '#61dafb', color: '#000' }}>A</Avatar>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, mt: '64px' }}>
        {/* Sidebar Drawer */}
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
              top: '64px',
              height: 'calc(100% - 64px)',
            },
          }}
        >
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeTab === item.id}
                onClick={() => handleMenuItemClick(item.id)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(97, 218, 251, 0.2)',
                    borderLeft: `4px solid ${item.color}`,
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(97, 218, 251, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                    color: activeTab === item.id ? item.color : '#ffffff',
                      fontWeight: activeTab === item.id ? 'bold' : 'normal',
                    },
                  }}
                />
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
          backgroundColor: '#ffffff',
            overflow: 'auto',
            transition: theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            ...(drawerOpen &&
              !isMobile && {
                marginLeft: 0,
              }),
          }}
        >
          {activeTab === 'home' ? (
            <Box>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#282c34' }}>
                  Dashboard Overview
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Welcome to the Micro-Frontend Platform. Select a module from
                  the side menu to get started.
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {menuItems.slice(1).map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      border: `2px solid ${item.color}`,
                        transition: 'all 0.3s ease',
                      cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: (theme) => theme.shadows[8],
                        },
                      }}
                      onClick={() => handleMenuItemClick(item.id)}
                    >
                      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                        <Box
                          sx={{
                            fontSize: '3rem',
                            mb: 2,
                            color: item.color,
                          }}
                        >
                      {item.icon}
                        </Box>
                        <Typography
                          variant="h5"
                          component="div"
                          gutterBottom
                          sx={{ color: item.color }}
                        >
                      {item.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                        <Button
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuItemClick(item.id);
                          }}
                          sx={{
                      backgroundColor: item.color,
                      color: '#ffffff',
                            '&:hover': {
                              backgroundColor: item.color,
                              opacity: 0.9,
                            },
                          }}
                        >
                      Open Module →
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : activeTab === 'error-monitor' ? (
            <ErrorMonitor />
          ) : (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    color:
                      menuItems.find((item) => item.id === activeTab)?.color ||
                      '#282c34',
                  }}
                >
                  {menuItems.find((item) => item.id === activeTab)?.icon}{' '}
                  {menuItems.find((item) => item.id === activeTab)?.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Micro-frontend loaded via Module Federation
                </Typography>
              </Box>
              {renderRemoteApp()}
            </Box>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <AppBar
        position="static"
        sx={{
          top: 'auto',
          bottom: 0,
        backgroundColor: '#282c34',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="#cccccc">
            © 2025 Micro-Frontend Platform. Built with React + MUI.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip
              label="🚀 All Services Running"
              size="small"
              sx={{ color: '#888888', borderColor: '#888888' }}
              variant="outlined"
            />
            <Chip
              label="⚡ Live Reload Active"
              size="small"
              sx={{ color: '#888888', borderColor: '#888888' }}
              variant="outlined"
            />
            <Chip
              label="🔧 Development Mode"
              size="small"
              sx={{ color: '#888888', borderColor: '#888888' }}
              variant="outlined"
            />
            <Badge badgeContent={stats.total} color="error" max={99}>
              <Chip
                icon={<BugReportIcon />}
                label={`Errors: ${stats.total}`}
                size="small"
                color={stats.total > 0 ? 'error' : 'default'}
                variant="outlined"
                onClick={() => setErrorPanelOpen(true)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
              />
            </Badge>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Error Panel */}
      <ErrorPanel
        isOpen={errorPanelOpen}
        onClose={() => setErrorPanelOpen(false)}
      />

      {/* Error Toast */}
      {showErrorToast && errors.length > 0 && errors.find(e => e.id === showErrorToast) && (
        <ErrorToast
          error={errors.find(e => e.id === showErrorToast)!}
          onDismiss={() => setShowErrorToast(null)}
          autoHideDuration={6000}
        />
      )}
    </Box>
  );
}

export default App;
