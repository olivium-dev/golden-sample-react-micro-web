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
  Alert,
  CircularProgress,
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
  id: string; // GUID format
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
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Get order ID from URL params or search params
  const orderIdFromParams = orderId;
  const orderData = searchParams.get('data');
  
  // Fetch order by ID if we have an orderId parameter
  const { data: orderResponse, isLoading, error } = useQuery({
    queryKey: ['order', orderIdFromParams],
    queryFn: async () => {
      console.log('🔍 Fetching order details for ID:', orderIdFromParams);
      const response = await OrderApiService.getOrderById(orderIdFromParams!);
      console.log('📦 Order API Response:', response);
      console.log('📦 Response structure:', {
        hasResponse: !!response,
        hasSuccess: response?.success,
        hasOrder: !!response?.order,
        responseKeys: response ? Object.keys(response) : [],
        orderKeys: response?.order ? Object.keys(response.order) : []
      });
      return response;
    },
    enabled: !!orderIdFromParams,
    retry: 2,
    retryDelay: 1000,
  });

  // Mutation for advancing order status
  const advanceStatusMutation = useMutation({
    mutationFn: ({ orderId, request }: { orderId: string; request: AdvanceOrderStatusRequest }) => {
      return OrderApiService.advanceOrderStatus(orderId, request);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderIdFromParams] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      console.error('Failed to advance order status:', error);
    },
  });

  // Handle advance status
  const handleAdvanceStatus = () => {
    if (orderIdFromParams && window.confirm('Are you sure you want to advance this order to the next status?')) {
      advanceStatusMutation.mutate({ 
        orderId: orderIdFromParams, 
        request: {} 
      });
    }
  };

  // If we have orderIdFromParams, use API data
  let order: Order | null = null;
  let apiOrder: any = null;
  let totalQuantity = 0;
  
  if (orderIdFromParams) {
    if (isLoading) {
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>Loading order details...</Typography>
          </Box>
        </Container>
      );
    }

    // Check if we have valid order data (either wrapped or direct)
    const orderData = orderResponse?.order || (orderResponse as any);
    const hasValidOrder = orderData && ((orderData as any).orderId || (orderData as any).id);
    
    if (error || !hasValidOrder) {
      console.error('❌ Order Details Error:', {
        error,
        orderResponse,
        hasSuccess: orderResponse?.success,
        hasOrder: !!orderResponse?.order,
        hasValidOrder,
        orderIdFromParams
      });
      
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Order Not Found
              </Typography>
              <Typography variant="body2">
                The requested order could not be found or there was an error loading it.
              </Typography>
              {error && (
                <Typography variant="body2" sx={{ mt: 1, color: 'error.main' }}>
                  Error: {error instanceof Error ? error.message : 'Unknown error'}
                </Typography>
              )}
            </Alert>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/orders')}
              sx={{ mt: 2 }}
            >
              Back to Orders
            </Button>
          </Paper>
        </Container>
      );
    }

    // Transform API order to component format
    // Handle both wrapped response and direct order data
    apiOrder = orderResponse?.order || (orderResponse as any);
    const firstItem = apiOrder.items && apiOrder.items.length > 0 ? apiOrder.items[0] : null;

    totalQuantity = apiOrder.items ? apiOrder.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) : 0;
    
    order = {
      id: apiOrder.orderId, // Use orderId from API
      product_name: firstItem?.productName || firstItem?.itemName || 'Multiple Items',
      quantity: totalQuantity,
      unit_price: firstItem?.unitPrice || 0,
      total_amount: apiOrder.total, // Use total from API
      status: apiOrder.status.toLowerCase(),
      order_date: apiOrder.createdAt,
      shipping_address: apiOrder.shippingAddress || 'N/A',
      notes: apiOrder.notes || '',
    };
  } else if (orderData) {
    // Fallback to search params data
    try {
      order = JSON.parse(decodeURIComponent(orderData));
    } catch (error) {
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Invalid Order Data
              </Typography>
              <Typography variant="body2">
                The order data appears to be corrupted. Please try again.
              </Typography>
            </Alert>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/orders')}
              sx={{ mt: 2 }}
            >
              Back to Orders
            </Button>
          </Paper>
        </Container>
      );
    }
  } else {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              No Order Data Found
            </Typography>
            <Typography variant="body2">
              Please select an order from the orders list to view its details.
            </Typography>
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/orders')}
            sx={{ mt: 2 }}
          >
            Back to Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!order) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatOrderId = (id: string) => {
    // If it's a GUID, show first 8 characters for readability
    if (id && id.length > 8 && id.includes('-')) {
      return id.substring(0, 8).toUpperCase();
    }
    return id;
  };

  const isGuid = (id: string) => {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(id);
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    return statusColors[normalizedStatus as keyof typeof statusColors] || 'default';
  };

  const canAdvanceStatus = order.status !== 'cancelled' && order.status !== 'delivered';

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2, backgroundColor: '#f5f5f5', '&:hover': { backgroundColor: '#e0e0e0' } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <OrderIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Order Details
        </Typography>
        {orderIdFromParams && canAdvanceStatus && (
          <Button
            variant="contained"
            color="success"
            startIcon={<AdvanceIcon />}
            onClick={handleAdvanceStatus}
            disabled={advanceStatusMutation.isPending}
            sx={{ ml: 2 }}
          >
            {advanceStatusMutation.isPending ? 'Advancing...' : 'Advance Status'}
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        {/* Order Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
              Order #{formatOrderId(order.id)}
            </Typography>
            {isGuid(order.id) && (
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5, fontFamily: 'monospace' }}>
                ID: {order.id}
              </Typography>
            )}
          </Box>
          <Chip
            label={order.status?.toUpperCase() || 'UNKNOWN'}
            color={getStatusColor(order.status || '')}
            size="medium"
            sx={{ fontWeight: 600, fontSize: '1rem', px: 2, py: 1 }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Order Information Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50' }}>
              Order Information
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 500, 
                    fontFamily: isGuid(order.id) ? 'monospace' : 'inherit',
                    fontSize: isGuid(order.id) ? '0.875rem' : 'inherit',
                    wordBreak: 'break-all'
                  }}
                >
                  {order.id}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Product Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {order.product_name || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Quantity
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {order.quantity || 0}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Unit Price
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatCurrency(order.unit_price || 0)}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Order Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {order.order_date ? formatDate(order.order_date) : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50' }}>
              Shipping & Payment
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#27ae60' }}>
                  {formatCurrency(order.total_amount || 0)}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Shipping Address
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {order.shipping_address || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {order.notes || 'No notes available'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Products Section */}
        <Divider sx={{ mt: 4, mb: 3 }} />
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Products
        </Typography>
        
        {apiOrder.items && apiOrder.items.length > 0 ? (
          <Box sx={{ mb: 4 }}>
            {apiOrder.items.map((item: any, index: number) => (
              <Paper 
                key={item.itemId || item.id || index} 
                sx={{ 
                  p: 3, 
                  mb: 2, 
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  '&:hover': { boxShadow: 2 }
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Product Name
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {item.itemName || item.productName || 'Unknown Product'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      ID: {item.itemId || item.productId || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Quantity
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      {item.quantity || 0}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Unit Price
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      {formatCurrency(item.unitPrice || 0)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Price
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#27ae60',
                        fontSize: '1.25rem'
                      }}
                    >
                      {formatCurrency(item.totalPrice || (item.quantity * item.unitPrice) || 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            {/* Order Summary */}
            <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', border: '2px solid #e9ecef' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Order Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {apiOrder.items.length} item{apiOrder.items.length !== 1 ? 's' : ''} • 
                    Total Quantity: {totalQuantity}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Grand Total
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#27ae60'
                    }}
                  >
                    {formatCurrency(apiOrder.total || 0)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
            <Typography variant="body1" color="text.secondary">
              No products found in this order
            </Typography>
          </Paper>
        )}

        {/* Action Buttons */}
        <Divider sx={{ mt: 4, mb: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/orders')}
            size="large"
          >
            Back to Orders
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {orderIdFromParams && canAdvanceStatus && (
              <Button
                variant="contained"
                color="success"
                startIcon={<AdvanceIcon />}
                onClick={handleAdvanceStatus}
                disabled={advanceStatusMutation.isPending}
                size="large"
              >
                {advanceStatusMutation.isPending ? 'Advancing...' : 'Advance Status'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderDetails;
