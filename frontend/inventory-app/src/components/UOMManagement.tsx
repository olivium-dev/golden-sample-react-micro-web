import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { AxiosError } from 'axios';
import { UOM, CreateUOMRequest, UpdateUOMRequest, ApiErrorResponse } from '../types/inventory';
import { uomApi } from '../services/api';

const UOMManagement: React.FC = () => {
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUOM, setEditingUOM] = useState<UOM | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    baseQuantity: number | '';
  }>({
    code: '',
    name: '',
    baseQuantity: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Error dialog state for detailed error messages
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: '',
    message: '',
  });

  // Fetch UOMs on component mount
  useEffect(() => {
    fetchUOMs();
  }, []);

  const fetchUOMs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await uomApi.getAll();
      setUoms(data);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.detail ||
        axiosError.response?.data?.title ||
        axiosError.message ||
        'Failed to load UOMs'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (uom?: UOM) => {
    // Always reset error first
    setFormError(null);
    
    if (uom && uom.id) {
      // Edit mode - use API value exactly as returned, including 0
      setEditingUOM(uom);
      setFormData({ 
        code: uom.code, 
        name: uom.name,
        baseQuantity: uom.baseQuantity !== undefined && uom.baseQuantity !== null ? uom.baseQuantity : '',
      });
    } else {
      // Create mode - explicitly reset everything to ensure clean state
      setEditingUOM(null);
      setFormData({ code: '', name: '', baseQuantity: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!saving) {
      setDialogOpen(false);
      setEditingUOM(null);
      setFormData({ code: '', name: '', baseQuantity: '' });
      setFormError(null);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (field === 'baseQuantity') {
      const inputValue = e.target.value;
      // Allow empty string for placeholder behavior
      const value = inputValue === '' ? '' : parseFloat(inputValue) || '';
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    }
    setFormError(null);
  };

  const handleSaveUOM = async () => {
    // Validation
    if (!formData.code.trim()) {
      setFormError('Code is required');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }
    const baseQty = typeof formData.baseQuantity === 'number' ? formData.baseQuantity : 0;
    if (baseQty < 0) {
      setFormError('Base quantity must be 0 or greater');
      return;
    }
    if (baseQty === 0) {
      setFormError('Base quantity cannot be 0. Please enter a value greater than 0.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      
      if (editingUOM && editingUOM.id) {
        // Update existing UOM
        await uomApi.update(editingUOM.id, {
          code: formData.code.trim(),
          name: formData.name.trim(),
          baseQuantity: baseQty,
        });
        
        setSnackbar({
          open: true,
          message: `UOM "${formData.code}" updated successfully!`,
          severity: 'success',
        });
      } else {
        // Create new UOM
        await uomApi.create({
          code: formData.code.trim(),
          name: formData.name.trim(),
          baseQuantity: baseQty,
        });
        
        setSnackbar({
          open: true,
          message: `UOM "${formData.code}" created successfully!`,
          severity: 'success',
        });
      }
      
      handleCloseDialog();
      fetchUOMs(); // Refresh the list
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setFormError(
        axiosError.response?.data?.detail ||
        axiosError.response?.data?.title ||
        axiosError.message ||
        `Failed to ${editingUOM ? 'update' : 'create'} UOM`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUOM = async (uom: UOM) => {
    if (!uom.id) {
      setSnackbar({
        open: true,
        message: 'Cannot delete UOM: ID is missing',
        severity: 'error',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete UOM "${uom.code}"?`)) {
      return;
    }

    try {
      await uomApi.delete(uom.id);
      setSnackbar({
        open: true,
        message: `UOM "${uom.code}" deleted successfully!`,
        severity: 'success',
      });
      fetchUOMs();
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const errorData = axiosError.response?.data;
      
      // Handle the specific error format for UOM in use - only show message, not errorDetails
      let errorMessage = 'Failed to delete UOM';
      if (errorData?.message) {
        // Use message if available (this is the main message, not the detailed one)
        errorMessage = errorData.message;
      } else if (errorData?.detail) {
        // Fallback to detail
        errorMessage = errorData.detail;
      } else if (axiosError.message) {
        // Fallback to axios error message
        errorMessage = axiosError.message;
      }
      
      // Show error in dialog for better visibility
      setErrorDialog({
        open: true,
        title: `Cannot Delete UOM "${uom.code}"`,
        message: errorMessage,
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCloseErrorDialog = () => {
    setErrorDialog({ open: false, title: '', message: '' });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Unit of Measure (UOM) Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUOMs}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#61dafb',
              color: '#000',
              '&:hover': { backgroundColor: '#4fb3d4' },
            }}
          >
            Create UOM
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Code</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Base Quantity</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {uoms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary">
                      No UOMs found. Click "Create UOM" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                uoms.map((uom) => (
                  <TableRow key={uom.id || uom.code} hover>
                    <TableCell>{uom.code}</TableCell>
                    <TableCell>{uom.name}</TableCell>
                    <TableCell>{uom.baseQuantity ?? 0}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(uom)}
                        title="Edit UOM"
                        disabled={!uom.id}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUOM(uom)}
                        title="Delete UOM"
                        disabled={!uom.id}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit UOM Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUOM ? 'Edit UOM' : 'Create New UOM'}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {formError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Code"
              value={formData.code}
              onChange={handleInputChange('code')}
              fullWidth
              required
              disabled={saving || !!editingUOM}
              placeholder="e.g., PCS, KG, LTR"
              helperText="Unique identifier for the UOM"
              autoFocus
            />
            <TextField
              label="Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              fullWidth
              required
              disabled={saving}
              placeholder="e.g., Pieces, Kilograms, Liters"
              helperText="Display name for the UOM"
            />
            <TextField
              label="Base Quantity"
              type="number"
              value={formData.baseQuantity === 0 ? 0 : (formData.baseQuantity || '')}
              onChange={handleInputChange('baseQuantity')}
              onFocus={(e) => {
                if (formData.baseQuantity === 0) {
                  e.target.select();
                }
              }}
              fullWidth
              required
              disabled={saving}
              inputProps={{ min: 0, step: 'any' }}
              placeholder="0"
              helperText="Base quantity for the UOM"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUOM}
            variant="contained"
            disabled={saving}
            startIcon={saving && <CircularProgress size={20} />}
            sx={{
              backgroundColor: '#61dafb',
              color: '#000',
              '&:hover': { backgroundColor: '#4fb3d4' },
            }}
          >
            {saving ? (editingUOM ? 'Updating...' : 'Creating...') : (editingUOM ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Error Dialog for detailed error messages */}
      <Dialog 
        open={errorDialog.open} 
        onClose={handleCloseErrorDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          color: 'error.main',
          fontWeight: 600,
          fontSize: '1.25rem'
        }}>
          {errorDialog.title}
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={500}>
              This UOM cannot be deleted because it is currently in use.
            </Typography>
          </Alert>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'text.primary' }}>
            {errorDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseErrorDialog} 
            variant="contained"
            color="error"
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UOMManagement;

