/**
 * Component: DataRowDialog
 * Dialog for creating/editing data rows
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import { DataRow } from '../../domain/entities/DataRow';
import { appConfig } from '../../infra/config/appConfig';

interface DataRowDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  editingRow: DataRow | null;
}

export const DataRowDialog: React.FC<DataRowDialogProps> = ({
  open,
  onClose,
  onSave,
  editingRow,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    value: 0,
    status: 'active',
    description: '',
  });

  useEffect(() => {
    if (editingRow) {
      setFormData({
        name: editingRow.name,
        category: editingRow.category,
        value: editingRow.value,
        status: editingRow.status,
        description: editingRow.description || '',
      });
    } else {
      setFormData({
        name: '',
        category: '',
        value: 0,
        status: 'active',
        description: '',
      });
    }
  }, [editingRow, open]);

  const handleSave = async () => {
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingRow ? 'Edit Data Row' : 'Create New Data Row'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {appConfig.categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Value"
            type="number"
            value={formData.value || ''}
            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
            required
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              {appConfig.statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            backgroundColor: '#ff6b6b',
            '&:hover': { backgroundColor: '#e55a5a' },
          }}
        >
          {editingRow ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

