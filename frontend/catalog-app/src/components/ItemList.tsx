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
  Link as LinkIcon,
  LinkOff as UnlinkIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { itemApi, tagApi, categoryApi, inventoryApi } from '../services/api';
import { GetItemForCmsResponse, ItemDetailsForCms, ItemResponse, SearchItemsRequest, StockLevel, StockLevelApiItem } from '../types/item';
import { CategoryCmsResponse } from '../types/category';
import { AdditionalParamsService } from '../services/additionalParamsService';
import { ActionButtonConfig } from '../types/actionButtons';
import actionButtonsConfig from '../config/actionButtons.json';
import ItemDialog from './ItemDialog';
import LinkItemDialog from './LinkItemDialog';

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
  const [linkDialogOpen, setLinkDialogOpen] = useState<boolean>(false);
  const [itemToLink, setItemToLink] = useState<ItemResponse | null>(null);
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
  const [availableCategories, setAvailableCategories] = useState<CategoryCmsResponse[]>([]);
  
  // Stock levels state
  const [stockLevels, setStockLevels] = useState<Map<string, StockLevel>>(new Map());
  const [loadingStock, setLoadingStock] = useState<boolean>(false);

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
      const fetchedItems = response.items || [];
      setItems(fetchedItems);
      setTotalCount(response.totalCount);
      
      // Fetch stock levels for the items
      if (fetchedItems.length > 0) {
        fetchStockLevels(fetchedItems.map(item => item.guid));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      showSnackbar('Failed to load items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockLevels = async (itemIds: string[]) => {
    if (itemIds.length === 0) return;
    
    setLoadingStock(true);
    try {
      const response = await inventoryApi.getStockLevels(itemIds, true);
      const stockMap = new Map<string, StockLevel>();
      
      // API returns an array directly: StockLevelApiItem[]
      if (Array.isArray(response)) {
        response.forEach((stock: StockLevelApiItem) => {
          if (stock.itemId) {
            stockMap.set(stock.itemId, {
              itemId: stock.itemId,
              availableQuantity: stock.availableQuantity,
              reservedQuantity: stock.reservedQuantity,
              totalQuantity: stock.quantity,
            });
          }
        });
      }
      
      setStockLevels(stockMap);
    } catch (error) {
      console.error('Error fetching stock levels:', error);
      // Don't show error snackbar for stock - it's not critical
    } finally {
      setLoadingStock(false);
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
    setStockLevels(new Map()); // Clear stock levels when search is cleared
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

  // Handle opening link dialog
  const handleOpenLinkDialog = (item: ItemResponse) => {
    setItemToLink(item);
    setLinkDialogOpen(true);
  };

  // Handle closing link dialog
  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
    setItemToLink(null);
  };

  // Handle successful link operation
  const handleLinkSuccess = (result: any) => {
    showSnackbar(
      `Items linked successfully! Parent ID: ${result.parentId}${result.parentCreated ? ' (new parent created)' : ''}`,
      'success'
    );
    fetchItems(); // Refresh the items list
  };

  // Handle unlink operation
  const handleUnlinkItem = async (item: ItemResponse) => {
    if (!item.parent) {
      showSnackbar('Item has no parent to unlink from', 'error');
      return;
    }

    const confirmMessage = `Are you sure you want to unlink "${item.name || item.guid}" from its parent?`;
    if (window.confirm(confirmMessage)) {
      try {
        const response = await itemApi.unlinkItem({ itemId: item.guid });
        if (response.success) {
          showSnackbar('Item unlinked successfully', 'success');
          fetchItems(); // Refresh the items list
        } else {
          showSnackbar('Failed to unlink item', 'error');
        }
      } catch (error: any) {
        console.error('Error unlinking item:', error);
        showSnackbar(error.message || 'Failed to unlink item', 'error');
      }
    }
  };

  // Handle action button clicks
  const handleActionButtonClick = (buttonConfig: ActionButtonConfig, item: ItemResponse) => {
    if (buttonConfig.type === 'inventory') {
      // Store itemId and itemName in sessionStorage instead of URL params
      sessionStorage.setItem('inventoryItemId', item.guid);
      if (item.name) {
        sessionStorage.setItem('inventoryItemName', item.name);
      }
      
      // Check if we're in standalone catalog app (port 3005) or in container (port 3000)
      const isStandalone = window.location.port === '3005';
      
      if (isStandalone) {
        // Standalone catalog app - navigate to standalone inventory
        window.location.href = `http://localhost:3008/`;
      } else {
        // Running in container - navigate to inventory tab with clean URL
        window.location.href = `http://localhost:3000/?tab=inventory`;
      }
    }
    // Add other action button types here as needed
  };

  // Get icon component based on icon string
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Inventory':
        return <InventoryIcon fontSize="small" />;
      default:
        return null;
    }
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
    {
      field: 'parent',
      headerName: 'Parent',
      width: 120,
      renderCell: (params) => {
        const parentId = params.row.parent;
        return parentId ? (
          <Chip 
            label="Has Parent" 
            size="small" 
            color="success"
            title={`Parent ID: ${parentId}`}
          />
        ) : (
          <Chip 
            label="Root Item" 
            size="small" 
            color="default"
            title="No parent - this is a root item"
          />
        );
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
            <Chip key={index} label={tag} size="small" color="default" />
          ))}
          {params.row.tags?.length > 2 && (
            <Chip label={`+${params.row.tags.length - 2}`} size="small" color="default" />
          )}
        </Box>
      ),
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 150,
      renderCell: (params) => {
        const itemId = params.row.guid;
        const stock = stockLevels.get(itemId);
        
        if (loadingStock) {
          return <CircularProgress size={16} />;
        }
        
        if (!stock) {
          return <Typography variant="body2" color="text.secondary">N/A</Typography>;
        }
        
        // Extract availableQuantity and convert to integer
        const available = Math.floor(stock.availableQuantity ?? 0);
        
        // Color coding based on stock level
        let color: 'default' | 'success' | 'warning' | 'error' = 'default';
        if (available === 0) {
          color = 'error';
        } else if (available < 10) {
          color = 'warning';
        } else {
          color = 'success';
        }
        
        return (
          <Chip 
            label={available} 
            size="small" 
            color={color}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 280,
      sortable: false,
      renderCell: (params) => {
        const item = params.row as ItemResponse;
        const hasParent = item.parent && item.parent !== null;
        
        // Get enabled action buttons from config
        const enabledActions = (actionButtonsConfig as { actionButtons: ActionButtonConfig[] }).actionButtons.filter(btn => btn.enabled);
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(item)}
              color="primary"
              title="Edit item"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            
            {/* Render configurable action buttons */}
            {enabledActions.map((btnConfig) => (
              <IconButton
                key={btnConfig.id}
                size="small"
                onClick={() => handleActionButtonClick(btnConfig, item)}
                color={btnConfig.color}
                title={btnConfig.label}
              >
                {getIconComponent(btnConfig.icon)}
              </IconButton>
            ))}
            
            {hasParent ? (
              <IconButton
                size="small"
                onClick={() => handleUnlinkItem(item)}
                color="warning"
                title="Unlink from parent"
              >
                <UnlinkIcon fontSize="small" />
              </IconButton>
            ) : (
              <IconButton
                size="small"
                onClick={() => handleOpenLinkDialog(item)}
                color="info"
                title="Link with another item"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            )}
            
            <IconButton
              size="small"
              onClick={() => handleDeleteItem(item.guid)}
              color="error"
              title="Delete item"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      },
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

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={items}
          columns={columns}
          getRowId={(row) => row.guid}
          loading={loading}
          paginationMode="server"
          rowCount={totalCount}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          checkboxSelection
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

      {/* Link Item Dialog */}
      <LinkItemDialog
        open={linkDialogOpen}
        currentItem={itemToLink}
        onClose={handleCloseLinkDialog}
        onSuccess={handleLinkSuccess}
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
