import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Tooltip,
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
  StepConnector,
  stepConnectorClasses,
  styled,
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
  CalendarToday as DateIcon,
  Notes as NotesIcon,
  FastForward as AdvanceIcon,
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

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(95deg, #1976d2 0%, #64b5f6 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(95deg, #4caf50 0%, #8bc34a 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundImage: 'linear-gradient(136deg, #1976d2 0%, #64b5f6 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage: 'linear-gradient(136deg, #4caf50 0%, #8bc34a 100%)',
  }),
}));

function ColorlibStepIcon(props: any) {
  const { active, completed, className, icon } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <PendingIcon />,
    2: <ShippingIcon />,
    3: <DeliveredIcon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const ParceletDetails: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateParcelet } = useParceletContext();
  
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

  const parceletData = searchParams.get('data');
  const initialParcelet: Parcelet | null = parceletData ? JSON.parse(decodeURIComponent(parceletData)) : null;
  const parceletId = searchParams.has('id') ? parseInt(searchParams.get('id') || '0') : 0;
  
  const [parcelet, setParcelet] = useState<Parcelet | null>(initialParcelet);

  const { parcelets } = useParceletContext();
  
  useEffect(() => {
    if (!parcelet && parceletId > 0) {
      const contextParcelet = parcelets.find(p => p.id === parceletId);
      if (contextParcelet) {
        setParcelet(contextParcelet);
      }
    }
  }, [parcelet, parceletId, parcelets]);

  const advanceMutation = useMutation({
    mutationFn: async (parceletId: number) => {
      return await mockApiClient.put(`/parcelets/${parceletId}/advance`);
    },
    onSuccess: async (data) => {

      const updatedParcelet = data.data;
      
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('data', encodeURIComponent(JSON.stringify(updatedParcelet)));
      window.history.replaceState({}, '', newUrl.toString());
      
      setParcelet(updatedParcelet);
      

      updateParcelet(updatedParcelet);
      

      setSnackbar({
        open: true,
        message: `Parcelet #${updatedParcelet.id} advanced to ${updatedParcelet.status.toUpperCase()}!`,
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

    const nextStatus = parcelet.status === 'pending' ? 'shipped' : 'delivered';
    const confirmMessage = `Are you sure you want to advance parcelet #${parcelet.id} from ${parcelet.status.toUpperCase()} to ${nextStatus.toUpperCase()} status?`;
    

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
              icon={statusIcons[parcelet.status]}
              label={parcelet.status.toUpperCase()} 
              color={statusColors[parcelet.status]}
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

      {/* Top Timeline*/}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
            Delivery Progress
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Current status: <strong>{parcelet.status.toUpperCase()}</strong> • Last updated: {new Date(parcelet.updated_at).toLocaleString()}
          </Typography>
        </Box>
        
        <Stepper alternativeLabel activeStep={['pending', 'shipped', 'delivered'].indexOf(parcelet.status)} connector={<ColorlibConnector />}>
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: parcelet.status === 'pending' ? 600 : 400 }}>
                Pending
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Awaiting shipment
              </Typography>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: parcelet.status === 'shipped' ? 600 : 400 }}>
                Shipped
              </Typography>
              <Typography variant="caption" color="text.secondary">
                In transit
              </Typography>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: parcelet.status === 'delivered' ? 600 : 400 }}>
                Delivered
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
            </StepLabel>
          </Step>
        </Stepper>
        
        {parcelet.notes && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <NotesIcon sx={{ fontSize: 16, mr: 0.5 }} /> Latest Update:
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
              "{parcelet.notes}"
            </Typography>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Information */}
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
                    border: '1px solid #ddd'
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
                <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
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
