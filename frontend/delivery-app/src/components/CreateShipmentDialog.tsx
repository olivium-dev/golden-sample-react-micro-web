import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CreateShipmentRequest } from '../types/delivery';

interface CreateShipmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (shipmentData: CreateShipmentRequest) => Promise<void>;
  isLoading?: boolean;
}

const CreateShipmentDialog: React.FC<CreateShipmentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'US',
    productName: '',
    quantity: 1,
    carrier: 'PostNL',
    service: 'standard',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderId.trim()) newErrors.orderId = 'Order ID is required';
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Customer email is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.customerEmail && !emailRegex.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;


    const shipmentRequest: CreateShipmentRequest = {
      orderId: formData.orderId,
      address: {
        name: formData.customerName,
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        email: formData.customerEmail,
        phone: formData.customerPhone || undefined,
      },
      selection: {
        carrier: formData.carrier,
        service: formData.service,
      },
      workflow: {
        name: 'default_eu',
        version: 1,
      },
      tenantId: 'default',
      metadata: {
        additionalProp1: {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          productName: formData.productName,
          quantity: formData.quantity,
          shippingAddress: `${formData.street}, ${formData.city}, ${formData.postalCode}`,
        }
      },
    };


    try {
      await onSubmit(shipmentRequest);
      handleClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleClose = () => {
    setFormData({
      orderId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'US',
      productName: '',
      quantity: 1,
      carrier: 'PostNL',
      service: 'standard',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Create New Shipment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the details to create a new shipment
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" color="primary">Order Information</Typography>
            <TextField
              fullWidth
              label="Order ID"
              value={formData.orderId}
              onChange={(e) => handleInputChange('orderId', e.target.value)}
              error={!!errors.orderId}
              helperText={errors.orderId}
              required
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          <Grid item xs={12}>
            <Typography variant="h6" color="primary">Customer Information</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Customer Name"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              error={!!errors.customerName}
              helperText={errors.customerName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Customer Email"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              error={!!errors.customerEmail}
              helperText={errors.customerEmail}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          <Grid item xs={12}>
            <Typography variant="h6" color="primary">Shipping Address</Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              error={!!errors.street}
              helperText={errors.street}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              error={!!errors.city}
              helperText={errors.city}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Postal Code"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              error={!!errors.postalCode}
              helperText={errors.postalCode}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={formData.country}
                label="Country"
                onChange={(e) => handleInputChange('country', e.target.value)}
              >
                <MenuItem value="US">United States</MenuItem>
                <MenuItem value="NL">Netherlands</MenuItem>
                <MenuItem value="DE">Germany</MenuItem>
                <MenuItem value="FR">France</MenuItem>
                <MenuItem value="UK">United Kingdom</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          <Grid item xs={12}>
            <Typography variant="h6" color="primary">Product Information</Typography>
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Product Name"
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              error={!!errors.productName}
              helperText={errors.productName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              error={!!errors.quantity}
              helperText={errors.quantity}
              inputProps={{ min: 1 }}
              required
            />
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          <Grid item xs={12}>
            <Typography variant="h6" color="primary">Carrier Selection</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Carrier</InputLabel>
              <Select
                value={formData.carrier}
                label="Carrier"
                onChange={(e) => handleInputChange('carrier', e.target.value)}
              >
                <MenuItem value="PostNL">PostNL</MenuItem>
                <MenuItem value="DHL">DHL</MenuItem>
                <MenuItem value="FedEx">FedEx</MenuItem>
                <MenuItem value="UPS">UPS</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Service</InputLabel>
              <Select
                value={formData.service}
                label="Service"
                onChange={(e) => handleInputChange('service', e.target.value)}
              >
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="express">Express</MenuItem>
                <MenuItem value="overnight">Overnight</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Please fix the errors above before submitting.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? 'Creating...' : 'Create Shipment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateShipmentDialog;
