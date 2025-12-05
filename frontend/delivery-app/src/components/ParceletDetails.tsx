import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Schedule as PendingIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Inventory as ProductIcon,
  TrackChanges as TrackingIcon,
  Notes as NotesIcon,
  FastForward as AdvanceIcon,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { useParceletContext } from '../context/ParceletContext';

interface Parcelet {
  id: number;
  order_id: number;
  customer_name: string;
  customer_email: string;
  product_name: string;
  quantity: number;
  shipping_address: string;
  tracking_number: string;
  status: 'pending' | 'ready_for_pickup' | 'delivered';
  notes?: string;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  pending: 'warning',
  ready_for_pickup: 'info',
  delivered: 'success',
} as const;

const statusIcons = {
  pending: <PendingIcon />,
  ready_for_pickup: <ShippingIcon />,
  delivered: <DeliveredIcon />,
};

const ParceletDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateParcelet, advanceParcelet, parcelets } = useParceletContext();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning'
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    parceletId: 0
  });

  const parceletId = id ? parseInt(id) : 0;
  const [parcelet, setParcelet] = useState<Parcelet | null>(null);

  useEffect(() => {
    if (parceletId > 0) {
      const contextParcelet = parcelets.find(p => p.id === parceletId);
      if (contextParcelet) {
        setParcelet(contextParcelet);
      }
    }
  }, [parceletId, parcelets]);

  const advanceMutation = useMutation({
    mutationFn: async (parceletId: number) => {
      return await advanceParcelet(parceletId);
    },
    onSuccess: async (updatedParcelet) => {
      setParcelet(updatedParcelet);

      setSnackbar({
        open: true,
        message: `Parcelet #${updatedParcelet.id} advanced to ${updatedParcelet.status.toUpperCase().replace('_', ' ')}!`,
        severity: 'success'
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to advance parcelet status';

      setSnackbar({
        open: true,
        message: `Error: ${errorMessage}`,
        severity: 'error'
      });
    },
  });

  const handleAdvanceStatus = () => {
    if (!parcelet) return;

    let nextStatus: string;
    switch (parcelet.status) {
      case 'pending':
        nextStatus = 'READY FOR PICKUP';
        break;
      case 'ready_for_pickup':
        nextStatus = 'DELIVERED';
        break;
      default:
        return;
    }

    const confirmMessage = `Are you sure you want to advance parcelet #${parcelet.id} from ${parcelet.status.toUpperCase().replace('_', ' ')} to ${nextStatus} status?`;

    setConfirmDialog({
      open: true,
      title: `Advance Parcelet #${parcelet.id}`,
      message: confirmMessage,
      parceletId: parcelet.id
    });
  };

  const handleConfirmAdvance = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
    advanceMutation.mutate(confirmDialog.parceletId);
  };

  const handleCancelAdvance = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!parcelet) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" color="error">
          Parcelet not found
        </Typography>
        <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Parcelet Details #{parcelet.id}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={statusIcons[parcelet.status as keyof typeof statusIcons]}
              label={parcelet.status.toUpperCase().replace('_', ' ')}
              color={statusColors[parcelet.status as keyof typeof statusColors]}
              size="medium"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="body1" color="text.secondary">
              Order #{parcelet.order_id}
            </Typography>
          </Box>
        </Box>
        {parcelet.status !== 'delivered' && (
          <Button
            variant="contained"
            color="success"
            startIcon={<AdvanceIcon />}
            onClick={handleAdvanceStatus}
            disabled={advanceMutation.isPending}
            size="large"
          >
            {advanceMutation.isPending ? 'Advancing...' : 'Advance Status'}
          </Button>
        )}
      </Box>

      {/* Progress Timeline */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Delivery Progress
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Current status: <strong>{parcelet.status.toUpperCase().replace('_', ' ')}</strong> • Last updated: {new Date(parcelet.updated_at).toLocaleString()}
        </Typography>

        <Stepper activeStep={['pending', 'ready_for_pickup', 'delivered'].indexOf(parcelet.status)} alternativeLabel>
          <Step>
            <StepLabel>
              <Typography variant="subtitle2">Created</Typography>
              <Typography variant="caption" color="text.secondary">Awaiting processing</Typography>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>
              <Typography variant="subtitle2">Ready for Pickup</Typography>
              <Typography variant="caption" color="text.secondary">Available for collection</Typography>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>
              <Typography variant="subtitle2">Delivered</Typography>
              <Typography variant="caption" color="text.secondary">Completed</Typography>
            </StepLabel>
          </Step>
        </Stepper>

        {parcelet.notes && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <NotesIcon sx={{ fontSize: 16, mr: 0.5 }} /> Latest Update:
            </Typography>
            <Typography variant="body2">"{parcelet.notes}"</Typography>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Tracking Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrackingIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tracking Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tracking Number
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'monospace',
                    backgroundColor: '#f5f5f5',
                    padding: '8px 12px',
                    borderRadius: 1,
                  }}
                >
                  {parcelet.tracking_number}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(parcelet.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {new Date(parcelet.updated_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Customer Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Customer Name
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {parcelet.customer_name}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Email Address
                </Typography>
                <Typography variant="body1" sx={{ color: 'primary.main' }}>
                  {parcelet.customer_email}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <LocationIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  Shipping Address
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="body1">
                    {parcelet.shipping_address}
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ProductIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Product Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Product Name
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {parcelet.product_name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Quantity
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {parcelet.quantity}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelAdvance}
      >
        <DialogTitle>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAdvance} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAdvance}
            color="primary"
            variant="contained"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default ParceletDetails;
