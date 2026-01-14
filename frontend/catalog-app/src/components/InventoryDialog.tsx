import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { InventoryStockRequest } from '../types/actionButtons';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

interface InventoryDialogProps {
  open: boolean;
  itemId: string;
  itemName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const InventoryDialog: React.FC<InventoryDialogProps> = ({
  open,
  itemId,
  itemName,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Omit<InventoryStockRequest, 'locationId' | 'itemId'>>({
    uomCode: '',
    quantity: 0,
    clientRef: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'quantity' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.uomCode.trim()) {
      setError('UOM Code is required');
      return;
    }
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Reason is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData: InventoryStockRequest = {
        locationId: '00000000-0000-0000-0000-000000000001',
        itemId: itemId,
        uomCode: formData.uomCode,
        quantity: formData.quantity,
        clientRef: formData.clientRef || 'string',
        reason: formData.reason,
      };

      const response = await axios.post(
        `${API_BASE_URL}/gateway/api/Inventory/stock/string/add`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Service-API-Key': 'catalog-service-api-key-2024-secure',
            'X-Service-Token-Key': 'catalog-service-token-key-jkl012',
          },
        }
      );

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (err: any) {
      console.error('Error adding inventory stock:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.title ||
        err.message ||
        'Failed to add inventory stock'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        uomCode: '',
        quantity: 0,
        clientRef: '',
        reason: '',
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Manage Inventory
        {itemName && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Item: {itemName}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success">
              Inventory stock added successfully!
            </Alert>
          )}

          <TextField
            label="UOM Code"
            value={formData.uomCode}
            onChange={handleChange('uomCode')}
            fullWidth
            required
            disabled={loading || success}
            helperText="Unit of Measure Code"
          />

          <TextField
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange('quantity')}
            fullWidth
            required
            disabled={loading || success}
            inputProps={{ min: 0, step: 'any' }}
            helperText="Stock quantity to add"
          />

          <TextField
            label="Client Reference"
            value={formData.clientRef}
            onChange={handleChange('clientRef')}
            fullWidth
            disabled={loading || success}
            helperText="Optional client reference"
            placeholder="string"
          />

          <TextField
            label="Reason"
            value={formData.reason}
            onChange={handleChange('reason')}
            fullWidth
            required
            disabled={loading || success}
            multiline
            rows={3}
            helperText="Reason for this inventory change"
          />

          <Typography variant="caption" color="text.secondary">
            Location ID: 00000000-0000-0000-0000-000000000001 (Fixed)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Item ID: {itemId}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || success}
        >
          {loading ? 'Adding...' : 'Add Stock'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryDialog;

