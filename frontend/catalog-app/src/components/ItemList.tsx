import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
  Snackbar,
  Alert,
  TextField,
  Grid,
  Chip,
  Autocomplete,
  Collapse,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { itemApi, tagApi, categoryApi } from '../services/api';
import { GetItemForCmsResponse, ItemDetailsForCms, ItemResponse, SearchItemsRequest } from '../types/item';
import { CategoryResponse } from '../types/category';
import { AdditionalParamsService } from '../services/additionalParamsService';
import ItemDialog from './ItemDialog';

interface ItemWithDetails extends ItemResponse {
  details?: any[];
}

const ItemList: React.FC = () => {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<GetItemForCmsResponse | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Search filters
  const [searchExpanded, setSearchExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<string>('');
  const [searchCategories, setSearchCategories] = useState<string[]>([]);
  
  // Available options for filters
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<CategoryResponse[]>([]);

  // Load items on component mount and when pagination or search changes
  useEffect(() => {
    fetchItems();
  }, [paginationModel]);

  // Load available options on component mount
  useEffect(() => {
    loadAvailableOptions();
  }, []);

  const loadAvailableOptions = async () => {
    try {
      // Load available tags
      const tagResponse = await tagApi.getAllTagNames();
      setAvailableTags(tagResponse.tags || []);

      // Load available categories (first 100)
      const categoryResponse = await categoryApi.getCategories(100, 1);
      setAvailableCategories(categoryResponse.categories || []);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const searchRequest: SearchItemsRequest = {
        query: searchQuery || null,
        tags: searchTags.length > 0 ? searchTags : null,
        type: searchType || null,
        pageSize: paginationModel.pageSize,
        pageNumber: paginationModel.page + 1,
        language: 'en',
        categories: searchCategories.length > 0 ? searchCategories : null,
      };

      const response = await itemApi.searchItems(searchRequest);
      setItems(response.items || []);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error fetching items:', error);
      showSnackbar('Failed to load items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Reset to first page when searching
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchItems();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchTags([]);
    setSearchType('');
    setSearchCategories([]);
    setPaginationModel({ ...paginationModel, page: 0 });
    // Fetch will be triggered by useEffect when paginationModel changes
  };

  const handleOpenDialog = (item?: ItemResponse) => {
    if (item) {
      // For editing, we need to fetch the full item details first
      fetchItemDetails(item.guid);
    } else {
      setCurrentItem(null);
      setDialogOpen(true);
    }
  };

  const fetchItemDetails = async (guid: string) => {
    try {
      const itemDetails = await itemApi.getItemForCms(guid);
      setCurrentItem(itemDetails);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error fetching item details:', error);
      showSnackbar('Failed to load item details', 'error');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentItem(null);
  };

  const handleSaveItem = async (itemData: {
    parent: null;
    tags: string[] | null;
    type: string | null;
    details: any[] | null;
    additionalParams: { [key: string]: string | null } | null;
    categories: string[] | null;
  }) => {
    try {
      if (currentItem) {
        // Update existing item
        const response = await itemApi.updateItem({
          ...itemData,
          guid: currentItem.guid,
        });
        console.log('Update response:', response);
        showSnackbar('Item updated successfully', 'success');
      } else {
        // Create new item
        console.log('Sending create request with data:', itemData);
        const response = await itemApi.createItem(itemData);
        console.log('Create response:', response);
        showSnackbar('Item created successfully', 'success');
      }
      fetchItems();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving item:', error);
      
      // Extract more detailed error message if available
      let errorMessage = 'Failed to save item';
      if (error.response && error.response.data) {
        if (error.response.data.detail) {
          errorMessage = `Error: ${error.response.data.detail}`;
        } else if (error.response.data.title) {
          errorMessage = `Error: ${error.response.data.title}`;
        } else if (typeof error.response.data === 'string') {
          errorMessage = `Error: ${error.response.data}`;
        }
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleDeleteItem = async (guid: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await itemApi.deleteItem(guid);
        if (response.success) {
          showSnackbar('Item deleted successfully', 'success');
          fetchItems();
        } else {
          showSnackbar('Failed to delete item', 'error');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        showSnackbar('Failed to delete item', 'error');
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Define columns for the data grid
  const columns: GridColDef[] = [
        { 
      field: 'name', 
      headerName: 'Name', 
      width: 200,
      valueGetter: (params) => {
        return params.row.name || 'N/A';
      }
    },
    // Dynamic additional parameter columns
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      renderCell: (params) => {
        const price = params.row.additionalParams?.price;
        const currency = params.row.additionalParams?.currency || 'USD';
        return price ? `${currency} ${parseFloat(price).toFixed(2)}` : 'N/A';
      }
    },
    {
      field: 'image',
      headerName: 'Image',
      width: 100,
      renderCell: (params) => {
        const imageName = params.row.additionalParams?.image;
        return imageName ? (
          <Chip 
            label="📷" 
            size="small" 
            variant="outlined" 
            color="primary"
            title={imageName}
          />
        ) : 'N/A';
      }
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.row.tags?.slice(0, 2).map((tag: string, index: number) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
          {params.row.tags?.length > 2 && (
            <Chip label={`+${params.row.tags.length - 2}`} size="small" variant="outlined" />
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row as ItemResponse)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteItem((params.row as ItemResponse).guid)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Items
        </Typography>
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
          Add Item
        </Button>
      </Box>

      {/* Search Filters */}
      <Box sx={{ mb: 3 }}>
        <Button
          onClick={() => setSearchExpanded(!searchExpanded)}
          startIcon={searchExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Search & Filters
        </Button>
        
        <Collapse in={searchExpanded}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search Query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Type"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  placeholder="Filter by type"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={availableTags}
                  value={searchTags}
                  onChange={(_, newValue) => setSearchTags(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Filter by tags"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={availableCategories}
                  getOptionLabel={(option) => option.name || option.guid}
                  value={availableCategories.filter(cat => searchCategories.includes(cat.guid))}
                  onChange={(_, newValue) => setSearchCategories(newValue.map(cat => cat.guid))}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option.name || option.guid} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Categories"
                      placeholder="Filter by categories"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={clearSearch}
                  >
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </Box>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={items}
          columns={columns}
          getRowId={(row) => row.guid}
          loading={loading}
          paginationMode="server"
          rowCount={totalCount}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:hover': {
              color: '#61dafb',
            },
          }}
        />
      </Box>

      {/* Item Dialog */}
      <ItemDialog
        open={dialogOpen}
        item={currentItem}
        onClose={handleCloseDialog}
        onSave={handleSaveItem}
      />

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

export default ItemList;
