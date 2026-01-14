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
} from '@mui/icons-material';
import { AxiosError } from 'axios';
import { UOM, CreateUOMRequest, ApiErrorResponse } from '../types/inventory';
import { uomApi } from '../services/api';

const UOMManagement: React.FC = () => {
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<CreateUOMRequest>({
    code: '',
    name: '',
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

  const handleOpenDialog = () => {
    setFormData({ code: '', name: '' });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!creating) {
      setDialogOpen(false);
      setFormData({ code: '', name: '' });
      setFormError(null);
    }
  };

  const handleInputChange = (field: keyof CreateUOMRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setFormError(null);
  };

  const handleCreateUOM = async () => {
    // Validation
    if (!formData.code.trim()) {
      setFormError('Code is required');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }

    setCreating(true);
    setFormError(null);

    try {
      await uomApi.create({
        code: formData.code.trim(),
        name: formData.name.trim(),
      });
      
      setSnackbar({
        open: true,
        message: `UOM "${formData.code}" created successfully!`,
        severity: 'success',
      });
      
      handleCloseDialog();
      fetchUOMs(); // Refresh the list
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setFormError(
        axiosError.response?.data?.detail ||
        axiosError.response?.data?.title ||
        axiosError.message ||
        'Failed to create UOM'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUOM = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete UOM "${code}"?`)) {
      return;
    }

    try {
      await uomApi.delete(code);
      setSnackbar({
        open: true,
        message: `UOM "${code}" deleted successfully!`,
        severity: 'success',
      });
      fetchUOMs();
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setSnackbar({
        open: true,
        message: axiosError.response?.data?.detail || 'Failed to delete UOM',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
            onClick={handleOpenDialog}
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
                <TableCell><strong>Description</strong></TableCell>
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
                  <TableRow key={uom.code} hover>
                    <TableCell>{uom.code}</TableCell>
                    <TableCell>{uom.name}</TableCell>
                    <TableCell>{uom.description || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUOM(uom.code)}
                        title="Delete UOM"
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

      {/* Create UOM Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New UOM</DialogTitle>
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
              disabled={creating}
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
              disabled={creating}
              placeholder="e.g., Pieces, Kilograms, Liters"
              helperText="Display name for the UOM"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateUOM}
            variant="contained"
            disabled={creating}
            startIcon={creating && <CircularProgress size={20} />}
            sx={{
              backgroundColor: '#61dafb',
              color: '#000',
              '&:hover': { backgroundColor: '#4fb3d4' },
            }}
          >
            {creating ? 'Creating...' : 'Create'}
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
    </Paper>
  );
};

export default UOMManagement;

