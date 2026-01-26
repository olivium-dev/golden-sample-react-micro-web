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
  Chip,
} from '@mui/material';
import { AxiosError } from 'axios';
import { UOM, InventoryStockRequest, ApiErrorResponse, StockLevelApiItem, StockByUom } from '../types/inventory';
import { uomApi, inventoryApi } from '../services/api';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://dev-creamat.fds-1.com';

const InventoryForm: React.FC = () => {
  // Get itemId and itemName from sessionStorage instead of URL params
  const itemId = sessionStorage.getItem('inventoryItemId') || '';
  const itemName = sessionStorage.getItem('inventoryItemName') || '';

  const [formData, setFormData] = useState<{
    uomCode: string;
    quantity: number | '';
  }>({
    uomCode: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [loadingUoms, setLoadingUoms] = useState(false);
  const [uomError, setUomError] = useState<string | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState<number | StockByUom[] | null>(null);
  const [loadingQuantity, setLoadingQuantity] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setError('Item ID is required. Please navigate from the catalog.');
    } else {
      // Fetch current inventory quantity for this item
      fetchCurrentQuantity();
    }
  }, [itemId]);

  // Fetch current inventory quantity
  const fetchCurrentQuantity = async () => {
    if (!itemId) return;
    
    setLoadingQuantity(true);
    try {
      const response = await inventoryApi.getStockLevels([itemId], true);
      if (Array.isArray(response) && response.length > 0) {
        const stock = response[0] as StockLevelApiItem;
        // Use stockByUoms if available, otherwise fallback to main availableQuantity
        if (stock.stockByUoms && stock.stockByUoms.length > 0) {
          // Store the full stockByUoms data for display
          setCurrentQuantity(stock.stockByUoms);
        } else {
          // Fallback to single value
          setCurrentQuantity(Math.floor(stock.availableQuantity ?? 0));
        }
      } else {
        setCurrentQuantity(0);
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      console.error('Error fetching current quantity:', axiosError.message);
      // Don't show error to user, just set to 0
      setCurrentQuantity(0);
    } finally {
      setLoadingQuantity(false);
    }
  };

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
    if (field === 'quantity') {
      const inputValue = e.target.value;
      // Allow empty string for placeholder behavior
      const value = inputValue === '' ? '' : parseFloat(inputValue) || '';
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    }
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
    if (!formData.quantity || formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData: InventoryStockRequest = {
        locationId: '00000000-0000-0000-0000-000000000001',
        itemId: itemId,
        uomCode: formData.uomCode,
        quantity: typeof formData.quantity === 'number' ? formData.quantity : 0,
      };

      await axios.post(
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
      // Refresh current quantity after successful add
      await fetchCurrentQuantity();
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
    // Check if running in standalone mode (port 3008)
    if (window.location.port === '3008') {
      // Standalone inventory app - navigate to standalone catalog
      window.location.href = 'http://localhost:3000/?tab=catalog';
    } else {
      // Running in container - use relative URL with tab parameter (same pattern as catalog)
      window.location.href = '/?tab=catalog';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Add Stock to Inventory
      </Typography>
        
        {itemName && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Item: <strong>{itemName}</strong>
          </Typography>
        )}

        {loadingQuantity ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Loading current stock...
            </Typography>
          </Box>
        ) : currentQuantity !== null && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 500, mb: 1 }}>
              Current Stock:
            </Typography>
            {Array.isArray(currentQuantity) ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {currentQuantity.map((uomStock, index) => (
                  <Chip
                    key={index}
                    label={`${uomStock.uomCode}: ${Math.floor(uomStock.availableQuantity).toLocaleString()}`}
                    size="small"
                    color={uomStock.availableQuantity === 0 ? 'error' : uomStock.availableQuantity < 10 ? 'warning' : 'success'}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                <strong>{typeof currentQuantity === 'number' ? currentQuantity.toLocaleString() : 'N/A'}</strong>
              </Typography>
            )}
          </Box>
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
            value={formData.quantity || ''}
            onChange={handleChange('quantity')}
            fullWidth
            required
            disabled={loading || success || !itemId}
            inputProps={{ min: 0, step: 'any' }}
            placeholder="0"
            helperText="Stock quantity to add"
          />

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

