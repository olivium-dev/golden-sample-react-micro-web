import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Snackbar,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Schedule as PendingIcon,
  FastForward as AdvanceIcon,
  Visibility as ViewIcon,
  LocalShipping as DeliveryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { mockApiClient } from '../services/mockApiClient';
import { Parcelet } from '../utils/localStorage';
import { useParceletContext } from '../context/ParceletContext';

const statusColors = {
  pending: 'warning',
  shipped: 'info',
  delivered: 'success',
} as const;

const statusIcons = {
  pending: <PendingIcon />,
  shipped: <ShippingIcon />,
  delivered: <DeliveredIcon />,
};

const ParceletsList: React.FC = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'warning' 
  });
  
  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    parceletId: 0,
    action: '' as 'advance' | 'reset'
  });

  const { 
    parcelets, 
    isLoading, 
    error, 
    refreshParcelets, 
    updateParcelet,
    resetParcelets,
    isResetting
  } = useParceletContext();

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Parcelet ID',
      width: 130,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: '#1976d2' }}>
          #{params.value}
        </Box>
      ),
    },
    {
      field: 'tracking_number',
      headerName: 'Tracking Number',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ 
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#2c3e50',
        }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'customer_name',
      headerName: 'Customer',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ lineHeight: 1.3 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 0.3 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block' }}>
            {params.row.customer_email}
          </Typography>
          <Typography variant="caption" color="primary.main" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
            Order #{params.row.order_id}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'product_name',
      headerName: 'Product',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ lineHeight: 1.3 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 0.3 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Qty: {params.row.quantity}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip 
          icon={statusIcons[params.value as keyof typeof statusIcons]}
          label={params.value.toUpperCase()} 
          color={statusColors[params.value as keyof typeof statusColors]}
          size="small"
          sx={{ 
            fontWeight: 600, 
            minWidth: '100px',
            fontSize: '0.75rem',
            height: '24px'
          }}
        />
      ),
    },
    {
      field: 'shipping_address',
      headerName: 'Shipping Address',
      minWidth: 250,
      flex: 1.2,
      renderCell: (params) => (
        <Tooltip title={params.value} arrow>
          <Box sx={{ 
            fontSize: '0.8rem',
            color: '#6c757d',
            lineHeight: 1.3,
            maxHeight: '2.6em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'updated_at',
      headerName: 'Last Updated',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ fontSize: '0.75rem', color: '#6c757d', textAlign: 'center', lineHeight: 1.2 }}>
          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.75rem', mb: 0.2 }}>
            {new Date(params.value).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {new Date(params.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
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
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={<ViewIcon sx={{ fontSize: '1.1rem' }} />}
            label="View Details"
            onClick={() => handleViewDetails(params.row)}
            color="primary"
            size="small"
            sx={{ 
              '&:hover': { backgroundColor: '#e3f2fd' },
              padding: '4px',
            }}
          />,
        ];

        // advance button
        if (params.row.status !== 'delivered') {
          actions.push(
            <GridActionsCellItem
              icon={<AdvanceIcon sx={{ fontSize: '1.1rem' }} />}
              label="Advance Status"
              onClick={() => handleAdvanceStatus(params.row.id)}
              color="success"
              size="small"
              sx={{ 
                '&:hover': { backgroundColor: '#e8f5e8' },
                padding: '4px',
              }}
            />
          );
        }

        return actions;
      },
    },
  ];

  const advanceMutation = useMutation({
    mutationFn: async (parceletId: number) => {
      return await mockApiClient.put(`/parcelets/${parceletId}/advance`);
    },
    onSuccess: async (data) => {
      // Update parcelet 
      updateParcelet(data.data);
      
      const newStatus = data.data.status;
      setSnackbar({ 
        open: true, 
        message: `Parcelet #${data.data.id} advanced to ${newStatus.toUpperCase()}!`, 
        severity: 'success' 
      });
      
      await refreshParcelets();
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to advance parcelet status';
      setSnackbar({ 
        open: true, 
        message: `Error: ${errorMessage}`, 
        severity: 'error' 
      });
      
      // Refresh to get the correct state
      refreshParcelets();
    },
  });

  // dialog confirmation
  const handleConfirmAdvance = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
    if (confirmDialog.action === 'advance') {
      advanceMutation.mutate(confirmDialog.parceletId);
    } else if (confirmDialog.action === 'reset') {
      handleResetConfirmed();
    }
  };
  
  // dialog cancellation
  const handleCancelAdvance = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  //reset button
  const handleResetClick = () => {
    setConfirmDialog({
      open: true,
      title: 'Reset Delivery Data',
      message: 'Are you sure you want to reset all delivery data? This will clear the local storage and reload fresh data from the server.',
      parceletId: 0,
      action: 'reset'
    });
  };

  //reset confirmation
  const handleResetConfirmed = async () => {
    try {
      await resetParcelets();
      setSnackbar({
        open: true,
        message: 'Delivery data has been reset successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error resetting data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  const handleAdvanceStatus = (parceletId: number) => {
    const parcelet = parcelets.find((p: Parcelet) => p.id === parceletId);
    if (!parcelet) return;

    const nextStatus = parcelet.status === 'pending' ? 'shipped' : 'delivered';
    const confirmMessage = `Are you sure you want to advance parcelet #${parceletId} from ${parcelet.status.toUpperCase()} to ${nextStatus.toUpperCase()} status?`;
    
    // Open dialog
    setConfirmDialog({
      open: true,
      title: `Advance Parcelet #${parceletId}`,
      message: confirmMessage,
      parceletId: parceletId,
      action: 'advance'
    });
  };

  const handleViewDetails = (parcelet: Parcelet) => {
    const parceletData = encodeURIComponent(JSON.stringify(parcelet));
    navigate(`/parcelet-details?data=${parceletData}&id=${parcelet.id}`);
  };

  // Group parcelets
  const statusCounts = parcelets.reduce((acc: any, parcelet: Parcelet) => {
    acc[parcelet.status] = (acc[parcelet.status] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4">Loading parcelets...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load parcelets: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DeliveryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
            Delivery Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="error"
          startIcon={isResetting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          onClick={handleResetClick}
          disabled={isLoading || isResetting}
          sx={{ minWidth: '120px' }}
        >
          {isResetting ? 'Resetting...' : 'Reset Data'}
        </Button>
      </Box>

      {/* Status Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <PendingIcon color="warning" />
            <Typography variant="h6" color="warning.main">Pending</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {statusCounts.pending || 0}
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <ShippingIcon color="info" />
            <Typography variant="h6" color="info.main">Shipped</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {statusCounts.shipped || 0}
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <DeliveredIcon color="success" />
            <Typography variant="h6" color="success.main">Delivered</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {statusCounts.delivered || 0}
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ height: 500, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={parcelets}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[15, 20, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          rowHeight={70}
          sx={{
            border: 'none',
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-cell': {
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '4px',
              paddingBottom: '4px',
              borderBottom: '1px solid #f0f0f0',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-columnHeader': {
              paddingLeft: '5px',
              paddingRight: '12px',
              paddingTop: '12px',
              paddingBottom: '12px',
              backgroundColor: 'rgba(250, 248, 248, 1)',
              borderBottom: '2px solid #e9ecef',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#495057',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: '#f8f9fa',
                cursor: 'pointer',
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
              minHeight: '48px',
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: '#fff',
            },
            '& .MuiDataGrid-actionsCell': {
              gap: '4px',
            },
          }}
        />
      </Paper>

      {parcelets.length === 0 && !isLoading && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <DeliveryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No parcelets found
          </Typography>
          <Typography color="text.secondary">
            Parcelets will appear here once orders are created
          </Typography>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelAdvance}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAdvance} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAdvance} 
            color={confirmDialog.action === 'reset' ? 'error' : 'primary'} 
            variant="contained" 
            autoFocus
          >
            {confirmDialog.action === 'reset' ? 'Reset' : 'Confirm'}
          </Button>
        </DialogActions>
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

export default ParceletsList;
