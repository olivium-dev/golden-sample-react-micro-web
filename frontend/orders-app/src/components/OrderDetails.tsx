import React from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  Grid,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as OrderIcon,
  PlayArrow as AdvanceIcon,
} from '@mui/icons-material';
import { 
  OrderApiService, 
  Order as ApiOrder,
  AdvanceOrderStatusRequest 
} from '../services/orderApi';

interface Order {
  id: number | string;
  product_name?: string;
  quantity?: number;
  unit_price?: number;
  total_amount?: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  order_date?: string;
  shipping_address?: string;
  notes?: string;
  [key: string]: any;
}

const statusColors = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
} as const;

const OrderDetails: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderData = searchParams.get('data');
  
  if (!orderData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Order Not Found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  let order: Order;
  try {
    order = JSON.parse(decodeURIComponent(orderData));
  } catch (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Invalid Order Data
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                onClick={() => navigate(-1)} 
                sx={{ 
                  mr: 2, 
                  bgcolor: '#e3f2fd', 
                  color: '#1976d2',
                  '&:hover': { bgcolor: '#bbdefb' }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <OrderIcon sx={{ mr: 2, color: '#1976d2', fontSize: 32 }} />
              <Box>
                <Typography variant="h4" fontWeight="600" color="#2c3e50">
                  Order #{order.id}
                </Typography>
                <Typography color="#6c757d" sx={{ mt: 0.5 }}>
                  {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={order.status?.toUpperCase()} 
              color={statusColors[order.status as keyof typeof statusColors] || 'default'}
              size="large"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Paper>

        {/* Order Details */}
        <Paper sx={{ p: 4, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={4}>
            
            {/* Product Section */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#f57c00', fontWeight: 600 }}>
                  📦 Product
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  {order.product_name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="#6c757d">
                  Quantity: {order.quantity || 0}
                </Typography>
              </Box>
            </Grid>
            
            {/* Pricing Section */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, bgcolor: '#f3e5f5', borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#7b1fa2', fontWeight: 600 }}>
                  💰 Pricing
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  ${order.unit_price?.toFixed(2) || '0.00'} × {order.quantity || 0}
                </Typography>
                <Typography variant="h6" sx={{ color: '#7b1fa2', fontWeight: 700 }}>
                  Total: ${order.total_amount?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Grid>
            
            {/* Shipping Section */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, bgcolor: '#e1f5fe', borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#0277bd', fontWeight: 600 }}>
                  🚚 Shipping
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {order.shipping_address || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            
            {/* Notes Section */}
            {order.notes && (
              <Grid item xs={12}>
                <Box sx={{ p: 3, bgcolor: '#fce4ec', borderRadius: 2, mt: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#c2185b', fontWeight: 600 }}>
                    📝 Notes
                  </Typography>
                  <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#424242' }}>
                    "{order.notes}"
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Back Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            Back to Orders
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default OrderDetails;