import React, { useState } from 'react';
import {
  Box,
  Container,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { Category as CategoryIcon, Inventory as InventoryIcon } from '@mui/icons-material';
import CategoryList from './components/CategoryList';
import ItemList from './components/ItemList';

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
      id={`catalog-tabpanel-${index}`}
      aria-labelledby={`catalog-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `catalog-tab-${index}`,
    'aria-controls': `catalog-tabpanel-${index}`,
  };
}

const App: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Check URL parameters on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam !== null) {
      const tabIndex = parseInt(tabParam, 10);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 1) {
        setTabValue(tabIndex);
      }
    }
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Update URL parameter
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newValue.toString());
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      <AppBar position="static" sx={{ backgroundColor: '#61dafb', color: '#000' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            📋 Catalog Management
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="catalog management tabs"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                },
                '& .Mui-selected': {
                  color: '#61dafb !important',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#61dafb',
                },
              }}
            >
              <Tab 
                icon={<CategoryIcon />} 
                label="Category Management" 
                iconPosition="start"
                {...a11yProps(0)} 
              />
              <Tab 
                icon={<InventoryIcon />} 
                label="Items Management" 
                iconPosition="start"
                {...a11yProps(1)} 
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <CategoryList />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <ItemList />
          </TabPanel>
        </Paper>
      </Container>
      
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            Catalog Management System © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default App;
