import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  ShoppingCart as OrderIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

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
  // Additional fields that might come from the real API
  orderId?: number | string;
  productName?: string;
  orderDate?: string;
  totalAmount?: number;
  [key: string]: any; // Allow additional fields
}

interface OrderFormData {
  product_name: string;
  quantity: number;
  unit_price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  notes?: string;
}

const initialFormData: OrderFormData = {
  product_name: '',
  quantity: 1,
  unit_price: 0,
  status: 'pending',
  shipping_address: '',
  notes: '',
};

const statusColors = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
} as const;

const OrdersList: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });

  const queryClient = useQueryClient();

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 140,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: '#1976d2' }}>
          #{params.value}
        </Box>
      ),
    },
    {
      field: 'product_name',
      headerName: 'Product',
      minWidth: 280,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ 
          fontWeight: 500, 
          color: '#2c3e50',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'quantity',
      headerName: 'Qty',
      width: 80,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ fontWeight: 500 }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'total_amount',
      headerName: 'Total',
      width: 120,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: '#2e7d32' }}>
          ${params.value.toFixed(2)}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip 
          label={params.value.toUpperCase()} 
          color={statusColors[params.value as keyof typeof statusColors]}
          size="small"
          sx={{ fontWeight: 600, minWidth: '80px' }}
        />
      ),
    },
    {
      field: 'order_date',
      headerName: 'Date',
      width: 120,
      type: 'date',
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => new Date(params.value),
      renderCell: (params) => (
        <Box sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
          {new Date(params.value).toLocaleDateString()}
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View Details"
          onClick={() => handleViewDetails(params.row)}
          color="primary"
          sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}
        />,
        <GridActionsCellItem
          icon={<CancelIcon />}
          label="Cancel Order"
          onClick={() => handleCancel(params.row.id)}
          color="error"
          sx={{ '&:hover': { backgroundColor: '#ffebee' } }}
          disabled={params.row.status === 'cancelled' || params.row.status === 'delivered'}
        />,
      ],
    },
  ];

  const { data: rawOrders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await apiClient.get('/users/b85951de-169f-4b96-83fd-346740877dd5/orders');
      return response.data;
    },
    retry: 2,
    retryDelay: 1000,
  });

  const orders = Array.isArray(rawOrders) ? rawOrders.map((order: any, index: number) => {
    const firstItem = order.items && order.items.length > 0 ? order.items[0] : {};
    const totalQuantity = order.items ? order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) : 1;
    const unitPrice = firstItem.unitPrice || firstItem.price || 0;
    
    let orderStatus = 'pending';
    if (order.status) {
      const status = order.status.toLowerCase();
      if (status.includes('pending') || status.includes('payment')) {
        orderStatus = 'pending';
      } else if (status.includes('process')) {
        orderStatus = 'processing';
      } else if (status.includes('ship')) {
        orderStatus = 'shipped';
      } else if (status.includes('deliver') || status.includes('complete')) {
        orderStatus = 'delivered';
      } else if (status.includes('cancel')) {
        orderStatus = 'cancelled';
      }
    }

    return {
      id: order.orderId || order.id || `order-${index}`,
      product_name: firstItem.itemName || firstItem.productName || firstItem.name || firstItem.title || 'N/A',
      quantity: totalQuantity,
      unit_price: unitPrice,
      total_amount: order.total || 0,
      status: orderStatus,
      order_date: order.createdAt || order.orderDate || order.created_at || new Date().toISOString(),
      shipping_address: firstItem.shippingAddress || firstItem.address || order.shippingAddress || order.address || 'N/A',
      notes: firstItem.tag || firstItem.notes || firstItem.description || order.notes || '',
    };
  }) : [];
  const createMutation = useMutation({
    mutationFn: (newOrder: OrderFormData) => {
      const userId = 'b85951de-169f-4b96-83fd-346740877dd5';
      const itemId = crypto.randomUUID();
      
      const payload = {
        userId: userId,
        items: [
          {
            itemId: itemId,
            itemName: newOrder.product_name,
            quantity: newOrder.quantity,
            unitPrice: newOrder.unit_price,
            tag: newOrder.notes || `Order for ${newOrder.product_name}`
          }
        ],
        tag: "order-checkout"
      };
      
      return apiClient.post('/Orders', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setOpen(false);
      setFormData(initialFormData);
      setSnackbar({ open: true, message: 'Order created successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: `Failed to create order: ${error.response?.data?.message || error.message}`, severity: 'error' });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number | string) => {
      return apiClient.put(`/Orders/${id}/status`, {
        status: 'Cancelled',
        tag: 'order-cancellation'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSnackbar({ open: true, message: 'Order cancelled successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: `Failed to cancel order: ${error.response?.data?.message || error.message}`, severity: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleCancel = (id: number | string) => {
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      cancelMutation.mutate(id);
    }
  };

  const handleViewDetails = (order: Order) => {
    const orderData = encodeURIComponent(JSON.stringify(order));
    navigate(`/order-details?data=${orderData}`);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormData);
  };

  const handleInputChange = (field: keyof OrderFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'quantity' || field === 'unit_price' 
      ? parseFloat(e.target.value) || 0 
      : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
          API Endpoint: /api/orders/users/b85951de-169f-4b96-83fd-346740877dd5/orders
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
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          size="large"
        >
          New Order
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={orders}
          columns={columns}
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
            Create your first order to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ mt: 3 }}
          >
            Create Order
          </Button>
        </Paper>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            Create New Order
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.product_name}
                onChange={handleInputChange('product_name')}
                required
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange('quantity')}
                  required
                  inputProps={{ min: 1 }}
                />
                <TextField
                  fullWidth
                  label="Unit Price"
                  type="number"
                  value={formData.unit_price}
                  onChange={handleInputChange('unit_price')}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <TextField
                  fullWidth
                  label="Total Amount"
                  value={`$${(formData.quantity * formData.unit_price).toFixed(2)}`}
                  disabled
                />
              </Box>
              
              <TextField
                fullWidth
                label="Shipping Address"
                multiline
                rows={2}
                value={formData.shipping_address}
                onChange={handleInputChange('shipping_address')}
                required
              />
              
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleInputChange('notes')}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={createMutation.isPending}
            >
              Create Order
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
    </Container>
  );
};

export default OrdersList;
