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
  Avatar,
  Chip
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Image as ImageIcon } from '@mui/icons-material';
import { categoryApi, cdnApi } from '../services/api';
import { CategoryCmsResponse, CategoryDetailsRequest, GetCategoryForCmsResponse } from '../types/category';
import CategoryDialog from './CategoryDialog';

interface CategoryWithDetails extends CategoryCmsResponse {
  details?: CategoryDetailsRequest[];
  mediaGuid?: string | null;
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<CategoryCmsResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryWithDetails | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load categories on component mount and when pagination changes
  useEffect(() => {
    fetchCategories();
  }, [paginationModel]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryApi.getCategories(
        paginationModel.pageSize,
        paginationModel.page + 1
      );
      setCategories(response.categories || []);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showSnackbar('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: CategoryCmsResponse) => {
    if (category) {
      // For editing, we need to fetch the full category details first
      fetchCategoryDetails(category.guid);
    } else {
      setCurrentCategory(null);
      setDialogOpen(true);
    }
  };

  const fetchCategoryDetails = async (guid: string) => {
    // Since CategoryDialog now handles CMS API loading internally,
    // we just need to pass the basic category info (guid is most important)
    const basicCategoryInfo = categories.find(cat => cat.guid === guid);
    if (basicCategoryInfo) {
      console.log('Opening category dialog for editing, guid:', guid);
      setCurrentCategory({
        guid: basicCategoryInfo.guid,
        name: basicCategoryInfo.name,
        // CategoryDialog will fetch full details using CMS API
      });
      setDialogOpen(true);
    } else {
      showSnackbar('Category not found', 'error');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentCategory(null);
  };

  const handleSaveCategory = async (details: CategoryDetailsRequest[], mediaGuid?: string | null) => {
    try {
      if (currentCategory) {
        // Update existing category
        const response = await categoryApi.updateCategory({
          guid: currentCategory.guid,
          details: details,
          mediaGuid: mediaGuid,
        });
        console.log('Update response:', response);
        showSnackbar('Category updated successfully', 'success');
      } else {
        // Create new category
        console.log('Sending create request with details:', details, 'mediaGuid:', mediaGuid);
        const response = await categoryApi.createCategory({
          details: details,
          mediaGuid: mediaGuid,
        });
        console.log('Create response:', response);
        showSnackbar('Category created successfully', 'success');
      }
      fetchCategories();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving category:', error);
      
      // Extract more detailed error message if available
      let errorMessage = 'Failed to save category';
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

  const handleDeleteCategory = async (guid: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await categoryApi.deleteCategory(guid);
        if (response.success) {
          showSnackbar('Category deleted successfully', 'success');
          fetchCategories();
        } else {
          showSnackbar('Failed to delete category', 'error');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        showSnackbar('Failed to delete category', 'error');
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
    {
      field: 'languages',
      headerName: 'Languages',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const category = params.row as CategoryCmsResponse;
        const languages = category.details?.map(d => d.language).filter(Boolean) || ['en'];
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {languages.map((lang, index) => (
              <Chip
                key={index}
                label={lang?.toUpperCase()}
                size="small"
                color="primary"
              />
            ))}
          </Box>
        );
      }
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
            onClick={() => handleOpenDialog(params.row as CategoryCmsResponse)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteCategory((params.row as CategoryCmsResponse).guid)}
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
          Categories
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
          Add Category
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={categories}
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

      {/* Category Dialog */}
      <CategoryDialog
        open={dialogOpen}
        category={currentCategory}
        onClose={handleCloseDialog}
        onSave={handleSaveCategory}
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

export default CategoryList;
