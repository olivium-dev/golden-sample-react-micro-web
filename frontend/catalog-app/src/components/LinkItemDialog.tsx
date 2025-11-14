import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Autocomplete,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import { itemApi } from '../services/api';
import { ItemResponse, SearchItemsRequest, LinkItemsResponse } from '../types/item';

interface LinkItemDialogProps {
  open: boolean;
  currentItem: ItemResponse | null;
  onClose: () => void;
  onSuccess: (result: LinkItemsResponse) => void;
}

const LinkItemDialog: React.FC<LinkItemDialogProps> = ({
  open,
  currentItem,
  onClose,
  onSuccess,
}) => {
  const [availableItems, setAvailableItems] = useState<ItemResponse[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [linking, setLinking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load available items when dialog opens
  useEffect(() => {
    if (open && currentItem) {
      loadAvailableItems();
    } else {
      // Reset state when dialog closes
      setAvailableItems([]);
      setSelectedItem(null);
      setError(null);
    }
  }, [open, currentItem]);

  const loadAvailableItems = async () => {
    if (!currentItem) return;

    setLoading(true);
    setError(null);

    try {
      // Load all items, excluding the current item
      const searchRequest: SearchItemsRequest = {
        query: null, // No search query - load all items
        tags: null,
        type: null,
        pageSize: 100, // Load more items for selection
        pageNumber: 1,
        language: 'en',
        categories: null,
      };

      const response = await itemApi.searchItems(searchRequest);
      
      // Filter out the current item from the results
      const filteredItems = (response.items || []).filter(
        item => item.guid !== currentItem.guid
      );

      setAvailableItems(filteredItems);
    } catch (error: any) {
      console.error('Error loading available items:', error);
      setError('Failed to load available items');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkItems = async () => {
    if (!currentItem || !selectedItem) return;

    setLinking(true);
    setError(null);

    try {
      const result = await itemApi.linkItems({
        firstItemId: currentItem.guid,
        secondItemId: selectedItem.guid,
      });

      if (result.success) {
        onSuccess(result);
        onClose();
      } else {
        setError('Link operation completed but was not successful');
      }
    } catch (error: any) {
      console.error('Error linking items:', error);
      setError(error.message || 'Failed to link items');
    } finally {
      setLinking(false);
    }
  };

  const handleClose = () => {
    if (!linking) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkIcon />
          Link Item
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {currentItem && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Current Item:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {currentItem.name || currentItem.guid}
              </Typography>
              {currentItem.tags && currentItem.tags.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {currentItem.tags.slice(0, 3).map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                  {currentItem.tags.length > 3 && (
                    <Chip label={`+${currentItem.tags.length - 3}`} size="small" variant="outlined" />
                  )}
                </Box>
              )}
            </Box>
          )}

          <Typography variant="subtitle1" gutterBottom>
            Select an item to link with:
          </Typography>

          <Autocomplete
            options={availableItems}
            getOptionLabel={(option) => option.name || option.guid}
            value={selectedItem}
            onChange={(_, newValue) => setSelectedItem(newValue)}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search and select item to link"
                placeholder="Type to search items or choose from the list"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body1">
                    {option.name || option.guid}
                  </Typography>
                  {option.description && (
                    <Typography variant="body2" color="text.secondary">
                      {option.description.length > 100 
                        ? `${option.description.substring(0, 100)}...` 
                        : option.description}
                    </Typography>
                  )}
                  {option.tags && option.tags.length > 0 && (
                    <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {option.tags.slice(0, 3).map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                      {option.tags.length > 3 && (
                        <Chip label={`+${option.tags.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
            noOptionsText={
              loading 
                ? "Loading items..." 
                : availableItems.length === 0 
                  ? "No items available for linking."
                  : "No matching items found"
            }
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {selectedItem && (
            <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Selected Item:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedItem.name || selectedItem.guid}
              </Typography>
              {selectedItem.description && (
                <Typography variant="body2" color="text.secondary">
                  {selectedItem.description}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={linking}>
          Cancel
        </Button>
        <Button
          onClick={handleLinkItems}
          variant="contained"
          disabled={!selectedItem || linking}
          startIcon={linking ? <CircularProgress size={20} /> : <LinkIcon />}
          sx={{
            backgroundColor: '#61dafb',
            color: '#000',
            '&:hover': { backgroundColor: '#4fb3d4' },
          }}
        >
          {linking ? 'Linking...' : 'Link Items'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkItemDialog;
