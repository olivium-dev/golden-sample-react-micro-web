import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  ShoppingCart as OrderIcon,
  PlayArrow as AdvanceIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  OrderApiService, 
  Order as ApiOrder, 
  OrderItem,
  OrderStatus,
  GetOrdersParams 
} from '../services/orderApi';

// Using ApiOrder directly from the API service


const statusColors = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
} as const;

const OrdersList: React.FC = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });
  const [loadingOrderDetails, setLoadingOrderDetails] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
    actionLabel: string;
    actionColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  }>({
    open: false,
    title: '',
    message: '',
    action: () => {},
    actionLabel: '',
    actionColor: 'primary',
  });

  const queryClient = useQueryClient();

  const columns: GridColDef[] = [
    {
      field: 'orderId',
      headerName: 'Order ID',
      width: 140,
      renderCell: (params) => {
        const id = params.value;
        const isGuid = id && id.length > 8 && id.includes('-');
        const displayId = isGuid ? id.substring(0, 8).toUpperCase() : id;
        
        return (
          <Box sx={{ fontWeight: 600, color: '#1976d2' }}>
            <Box component="span">#{displayId}</Box>
            {isGuid && (
              <Box 
                component="span" 
                sx={{ 
                  fontSize: '0.7rem', 
                  color: '#666', 
                  display: 'block',
                  fontFamily: 'monospace'
                }}
              >
                {id.substring(8, 13)}...
              </Box>
            )}
          </Box>
        );
      },
    },
    {
      field: 'userId',
      headerName: 'User ID',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ 
          fontWeight: 400, 
          color: '#6c757d',
          fontSize: '0.75rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {params.value.substring(0, 8)}...
        </Box>
      ),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: '#2e7d32' }}>
          ${params.value?.toFixed(2) || '0.00'}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const status = params.value?.toLowerCase() || 'unknown';
        const getStatusColor = (status: string) => {
          if (status.includes('pending') || status.includes('payment')) return 'warning';
          if (status.includes('process') || status.includes('confirmed')) return 'info';
          if (status.includes('ship')) return 'primary';
          if (status.includes('deliver') || status.includes('complete')) return 'success';
          if (status.includes('cancel')) return 'error';
          return 'default';
        };
        
        return (
          <Chip 
            label={params.value?.toUpperCase() || 'UNKNOWN'} 
            color={getStatusColor(status) as any}
            size="small"
            sx={{ fontWeight: 600, minWidth: '80px' }}
          />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 140,
      type: 'dateTime',
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.value ? new Date(params.value) : null,
      renderCell: (params) => (
        <Box sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
          {params.value ? new Date(params.value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
          }) : 'N/A'}
        </Box>
      ),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated',
      width: 140,
      type: 'dateTime',
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.value ? new Date(params.value) : null,
      renderCell: (params) => (
        <Box sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
          {params.value ? new Date(params.value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
          }) : 'N/A'}
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      getActions: (params) => {
        const order = params.row;
        const status = order.status?.toLowerCase() || '';
        const isCompleted = status === 'delivered' || status === 'completed';
        const isCancelled = status === 'cancelled';
        const canAdvance = !isCompleted && !isCancelled;
        const canCancel = !isCompleted && !isCancelled;

        return [
          <GridActionsCellItem
            key="view"
            icon={loadingOrderDetails === order.orderId ? <CircularProgress size={16} /> : <InfoIcon />}
            label="View Details"
            onClick={() => handleViewDetails(order)}
            color="primary"
            sx={{ 
              '&:hover': { backgroundColor: '#e3f2fd' },
              '& .MuiSvgIcon-root': { fontSize: '1.1rem' }
            }}
            disabled={loadingOrderDetails === order.orderId}
            showInMenu={false}
          />,
          <GridActionsCellItem
            key="advance"
            icon={<AdvanceIcon />}
            label={`Advance Status${status ? ` (${status})` : ''}`}
            onClick={() => handleAdvanceStatus(order.orderId, order)}
            color="success"
            sx={{ 
              '&:hover': { backgroundColor: '#e8f5e8' },
              '& .MuiSvgIcon-root': { fontSize: '1.1rem' }
            }}
            disabled={!canAdvance}
            showInMenu={false}
          />,
          <GridActionsCellItem
            key="cancel"
            icon={<CancelIcon />}
            label="Cancel Order"
            onClick={() => handleCancel(order.orderId, order)}
            color="error"
            sx={{ 
              '&:hover': { backgroundColor: '#ffebee' },
              '& .MuiSvgIcon-root': { fontSize: '1.1rem' }
            }}
            disabled={!canCancel}
            showInMenu={false}
          />,
        ];
      },
    },
  ];

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Check if user has access token before making API calls
  const hasAccessToken = (): boolean => {
    const token = localStorage.getItem('access_token');
    return Boolean(token && token.length > 0);
  };

  // Fetch orders using the new API service - only if authenticated
  const { data: ordersResponse, isLoading, error } = useQuery({
    queryKey: ['orders', page, pageSize, statusFilter],
    queryFn: async () => {
      const params: GetOrdersParams = {
        page,
        pageSize,
        ...(statusFilter && { status: statusFilter })
      };
      return await OrderApiService.getOrders(params);
    },
    retry: 2,
    retryDelay: 1000,
    enabled: hasAccessToken(), // Only run query if user has access token
  });

  // Fetch order statuses for filtering - only if authenticated
  const { data: statusesResponse } = useQuery({
    queryKey: ['orderStatuses'],
    queryFn: () => OrderApiService.getOrderStatuses(),
    retry: 2,
    retryDelay: 1000,
    enabled: hasAccessToken(), // Only run query if user has access token
  });

  // Use orders directly from API without transformation
  const orders: ApiOrder[] = ordersResponse?.orders || [];

  // Mutation for advancing order status
  const advanceStatusMutation = useMutation({
    mutationFn: ({ orderId, action }: { orderId: string; action?: string }) => {
      return OrderApiService.advanceOrderStatus(orderId, { action });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSnackbar({ 
        open: true, 
        message: `Order status updated successfully! ${data.newStatus ? `New status: ${data.newStatus}` : ''}`, 
        severity: 'success' 
      });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: `Failed to update order status: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number | string) => {
      return OrderApiService.advanceOrderStatus(String(id), { action: 'cancel' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSnackbar({ open: true, message: 'Order cancelled successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: `Failed to cancel order: ${error.response?.data?.message || error.message}`, severity: 'error' });
    },
  });


  const handleCancel = (id: number | string, order: ApiOrder) => {
    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
    const firstItemName = firstItem ? firstItem.itemName : (order.items && order.items.length > 0 ? 'Multiple Items' : 'No Items');
    
    setConfirmDialog({
      open: true,
      title: 'Cancel Order',
      message: `Are you sure you want to cancel order #${id}? This action cannot be undone.\n\nOrder Details:\n• Product: ${firstItemName}\n• Total: $${order.total?.toFixed(2) || '0.00'}\n• Current Status: ${order.status?.toUpperCase()}`,
      action: () => {
        cancelMutation.mutate(id);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
      actionLabel: 'Cancel Order',
      actionColor: 'error',
    });
  };

  const handleAdvanceStatus = (id: number | string, order: ApiOrder) => {
    const currentStatus = order.status?.toLowerCase() || 'unknown';
    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
    const firstItemName = firstItem ? firstItem.itemName : (order.items && order.items.length > 0 ? 'Multiple Items' : 'No Items');
    
    const getNextStatus = (status: string) => {
      switch (status.toUpperCase()) {
        case 'DRAFT': return 'PENDINGPAYMENT';
        case 'PENDINGPAYMENT': return 'PAID';
        case 'PAID': return 'SHIPPED';
        case 'SHIPPED': return 'DELIVERED';
        default: return 'Next Status';
      }
    };

    setConfirmDialog({
      open: true,
      title: 'Advance Order Status',
      message: `Advance order #${id} to the next status?\n\nOrder Details:\n• Product: ${firstItemName}\n• Total: $${order.total?.toFixed(2) || '0.00'}\n• Current Status: ${currentStatus.toUpperCase()}\n• Next Status: ${getNextStatus(currentStatus)}`,
      action: () => {
        advanceStatusMutation.mutate({ orderId: String(id) });
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
      actionLabel: 'Advance Status',
      actionColor: 'success',
    });
  };

  const handleViewDetails = async (order: ApiOrder) => {
    setLoadingOrderDetails(order.orderId);
    try {
      // Fetch the complete order details from the API
      console.log('🔍 OrdersList: Fetching order details for ID:', order.orderId);
      const orderResponse = await OrderApiService.getOrderById(order.orderId);
      console.log('📦 OrdersList: API Response:', orderResponse);
      console.log('📦 OrdersList: Response validation:', {
        hasResponse: !!orderResponse,
        hasSuccess: orderResponse?.success,
        successValue: orderResponse?.success,
        hasOrder: !!orderResponse?.order,
        responseKeys: orderResponse ? Object.keys(orderResponse) : [],
        orderKeys: orderResponse?.order ? Object.keys(orderResponse.order) : []
      });
      
      // Check if response is the order directly or wrapped in OrderResponse
      const orderData = orderResponse?.order || (orderResponse as any);
      
      if (orderData && orderData.orderId) {
        console.log('✅ OrdersList: Order data found, navigating to details');
        // Navigate to order details page with the orderId
        navigate(`/order-details/${order.orderId}`, {
          state: { orderData: orderData }
        });
      } else {
        console.error('❌ OrdersList: No valid order data found:', {
          hasOrderResponse: !!orderResponse,
          hasOrderField: !!orderResponse?.order,
          hasOrderId: !!((orderResponse as any)?.orderId || orderResponse?.order?.orderId),
          responseKeys: orderResponse ? Object.keys(orderResponse) : []
        });
        setSnackbar({
          open: true,
          message: `Failed to fetch order details: No valid order data received`,
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      
      let errorMessage = 'Unknown error';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'Access denied. You do not have permission to view this order.';
        } else if (status === 404) {
          errorMessage = 'Order not found. It may have been deleted or the ID is incorrect.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (data?.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `Server error (${status}): ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        // Other error
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: `Failed to fetch order details: ${errorMessage}`,
        severity: 'error'
      });
    } finally {
      setLoadingOrderDetails(null);
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };


  // Check authentication status
  if (!hasAccessToken()) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Authentication Required
            </Typography>
            <Typography variant="body2">
              Please log in to access the orders management system.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            You need to be authenticated to view and manage orders.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4">Loading orders...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load orders from API: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
        <Typography variant="body2" sx={{ mt: 2 }}>
          API Endpoint: /api/order
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <OrderIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
            Orders Management
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['orderStatuses'] });
            setSnackbar({ open: true, message: 'Orders refreshed successfully!', severity: 'success' });
          }}
          disabled={isLoading}
          size="large"
        >
          Refresh
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={orders}
          columns={columns}
          getRowId={(row) => row.orderId}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-cell': {
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid #f0f0f0',
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-columnHeader': {
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '16px',
              paddingBottom: '16px',
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #e9ecef',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#495057',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: '#f8f9fa',
              },
              '&.Mui-selected': {
                backgroundColor: '#e3f2fd',
                '&:hover': {
                  backgroundColor: '#bbdefb',
                },
              },
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '2px solid #e9ecef',
              backgroundColor: '#f8f9fa',
            },
          }}
        />
      </Paper>

      {orders.length === 0 && !isLoading && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <OrderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No orders found
          </Typography>
          <Typography color="text.secondary">
            No orders available at the moment
          </Typography>
        </Paper>
      )}


      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseConfirmDialog}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDialog.action}
            variant="contained"
            color={confirmDialog.actionColor}
            size="large"
            disabled={advanceStatusMutation.isPending || cancelMutation.isPending}
          >
            {advanceStatusMutation.isPending || cancelMutation.isPending 
              ? 'Processing...' 
              : confirmDialog.actionLabel
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrdersList;
