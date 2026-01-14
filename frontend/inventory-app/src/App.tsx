import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Straighten as UOMIcon,
} from '@mui/icons-material';
import InventoryForm from './components/InventoryForm';
import UOMManagement from './components/UOMManagement';
import './App.css';

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
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
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
    id: `inventory-tab-${index}`,
    'aria-controls': `inventory-tabpanel-${index}`,
  };
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="inventory management tabs"
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
                icon={<InventoryIcon />}
                label="Add Stock"
                iconPosition="start"
                {...a11yProps(0)}
              />
              <Tab
                icon={<UOMIcon />}
                label="UOM Management"
                iconPosition="start"
                {...a11yProps(1)}
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <InventoryForm />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <UOMManagement />
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
            Inventory Management System © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
