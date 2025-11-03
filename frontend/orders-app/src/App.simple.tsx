import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

function App() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <ShoppingCart sx={{ fontSize: 40, color: '#9c27b0' }} />
        <Typography variant="h4">Orders Management</Typography>
      </Box>
      
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          ✅ Orders App Loaded Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          The Orders micro-frontend is now integrated with the dashboard.
        </Typography>
        <Button variant="contained" color="primary">
          Test Button
        </Button>
      </Box>
    </Container>
  );
}

export default App;



