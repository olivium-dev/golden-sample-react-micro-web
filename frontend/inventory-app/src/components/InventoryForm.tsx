import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { AxiosError } from 'axios';
import { UOM, InventoryStockRequest, ApiErrorResponse } from '../types/inventory';
import { uomApi } from '../services/api';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://dev-creamat.fds-1.com';

const InventoryForm: React.FC = () => {
  // Get itemId and itemName from sessionStorage instead of URL params
  const itemId = sessionStorage.getItem('inventoryItemId') || '';
  const itemName = sessionStorage.getItem('inventoryItemName') || '';

  const [formData, setFormData] = useState<Omit<InventoryStockRequest, 'locationId' | 'itemId'>>({
    uomCode: '',
    quantity: 0,
    clientRef: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [loadingUoms, setLoadingUoms] = useState(false);
  const [uomError, setUomError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      setError('Item ID is required. Please navigate from the catalog.');
    }
  }, [itemId]);

  // Fetch UOMs when component mounts or when UOM field is focused
  const fetchUOMs = async () => {
    if (uoms.length > 0) return; // Already loaded
    
    setLoadingUoms(true);
    setUomError(null);
    try {
      const uomData = await uomApi.getAll();
      setUoms(uomData);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      console.error('Error fetching UOMs:', axiosError.message);
      setUomError(
        axiosError.response?.data?.detail ||
        axiosError.response?.data?.title ||
        axiosError.message ||
        'Failed to load UOMs'
      );
    } finally {
      setLoadingUoms(false);
    }
  };

  // Fetch UOMs when UOM field is clicked/focused
  const handleUOMFieldFocus = () => {
    if (uoms.length === 0 && !loadingUoms) {
      fetchUOMs();
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    const value = field === 'quantity' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!itemId) {
      setError('Item ID is required');
      return;
    }
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
        // Navigate back to catalog or home
        if (window.location.port === '3008') {
          // Standalone mode - can navigate to catalog if needed
          window.location.href = 'http://localhost:3000/?tab=catalog';
        } else {
          // Embedded mode - trigger navigation via event or window
          window.parent.postMessage({ type: 'inventory-success', itemId }, '*');
        }
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      console.error('Error adding inventory stock:', axiosError.message);
      setError(
        axiosError.response?.data?.detail ||
        axiosError.response?.data?.title ||
        axiosError.message ||
        'Failed to add inventory stock'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.location.port === '3008') {
      window.location.href = 'http://localhost:3000/?tab=catalog';
    } else {
      window.history.back();
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Add Stock to Inventory
      </Typography>
        
        {itemName && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Item: <strong>{itemName}</strong>
          </Typography>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Inventory stock added successfully! Redirecting...
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Item ID"
            value={itemId}
            fullWidth
            disabled
            helperText="Pre-populated from catalog"
          />

          <FormControl fullWidth required disabled={loading || success || !itemId}>
            <InputLabel id="uom-code-label">UOM Code</InputLabel>
            <Select
              labelId="uom-code-label"
              label="UOM Code"
              value={formData.uomCode}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, uomCode: e.target.value }));
                setError(null);
              }}
              onOpen={handleUOMFieldFocus}
              onFocus={handleUOMFieldFocus}
              disabled={loading || success || !itemId}
            >
              {loadingUoms ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading UOMs...
                </MenuItem>
              ) : uoms.length === 0 ? (
                <MenuItem disabled>
                  {uomError || 'No UOMs available'}
                </MenuItem>
              ) : (
                uoms.map((uom) => (
                  <MenuItem key={uom.code} value={uom.code}>
                    {uom.code} {uom.name ? `- ${uom.name}` : ''}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>
              {uomError ? uomError : 'Unit of Measure Code - Click to load options'}
            </FormHelperText>
          </FormControl>

          <TextField
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange('quantity')}
            fullWidth
            required
            disabled={loading || success || !itemId}
            inputProps={{ min: 0, step: 'any' }}
            helperText="Stock quantity to add"
          />

          <TextField
            label="Client Reference"
            value={formData.clientRef}
            onChange={handleChange('clientRef')}
            fullWidth
            disabled={loading || success || !itemId}
            helperText="Optional client reference"
            placeholder="string"
          />

          <TextField
            label="Reason"
            value={formData.reason}
            onChange={handleChange('reason')}
            fullWidth
            required
            disabled={loading || success || !itemId}
            multiline
            rows={3}
            helperText="Reason for this inventory change"
          />

          <Typography variant="caption" color="text.secondary">
            Location ID: 00000000-0000-0000-0000-000000000001 (Fixed)
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              onClick={handleBack}
              variant="outlined"
              disabled={loading}
            >
              Back to Catalog
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || success || !itemId}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Adding...' : 'Add Stock'}
            </Button>
          </Box>
        </Box>
      </Paper>
  );
};

export default InventoryForm;

