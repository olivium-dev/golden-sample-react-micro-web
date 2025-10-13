/**
 * Page: DataGridPage
 * Main page component for Data Grid with MUI X DataGrid
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  InputAdornment,
  Alert,
  Snackbar,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { DataGridViewModel } from '../viewmodels/useDataGridViewModel';
import { DataRowDialog } from '../components/DataRowDialog';
import { appConfig } from '../../infra/config/appConfig';

interface DataGridPageProps {
  viewModel: DataGridViewModel;
}

export const DataGridPage: React.FC<DataGridPageProps> = ({ viewModel }) => {
  const {
    data,
    loading,
    error,
    selectedRows,
    editingRow,
    dialogOpen,
    searchQuery,
    categoryFilter,
    statusFilter,
    fetchData,
    createRow,
    updateRow,
    deleteRow,
    openDialog,
    closeDialog,
    setSearchQuery,
    setCategoryFilter,
    setStatusFilter,
    setSelectedRows,
  } = viewModel;

  const handleSaveRow = async (formData: any) => {
    if (editingRow) {
      await updateRow(editingRow.id, formData);
    } else {
      await createRow(formData);
    }
  };

  const handleDeleteRow = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      await deleteRow(id);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200, flex: 1 },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value} color="primary" size="small" variant="outlined" />
      ),
    },
    {
      field: 'value',
      headerName: 'Value',
      width: 120,
      type: 'number',
      valueFormatter: (params) => `$${params.value?.toFixed(2) || '0.00'}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const colorMap: any = {
          active: 'success',
          pending: 'warning',
          completed: 'info',
          archived: 'default',
        };
        return (
          <Chip
            label={params.value}
            color={colorMap[params.value] || 'default'}
            size="small"
          />
        );
      },
    },
    { field: 'description', headerName: 'Description', width: 200, flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => openDialog(params.row)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteRow(params.row.id)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredData = data.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;
    return matchesSearch;
  });

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: '#ff6b6b' }}>
              📊 Data Grid
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage data with advanced filtering
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog()}
            sx={{
              backgroundColor: '#ff6b6b',
              '&:hover': { backgroundColor: '#e55a5a' },
            }}
          >
            Add Data
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
              startAdornment={<FilterListIcon sx={{ mr: 1, ml: 1 }} />}
            >
              <MenuItem value="">All</MenuItem>
              {appConfig.categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {appConfig.statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>
            Refresh
          </Button>
        </Box>

        {/* DataGrid */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            loading={loading}
            pageSizeOptions={appConfig.pagination.pageSizeOptions}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: appConfig.pagination.defaultPageSize,
                },
              },
            }}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection as number[]);
            }}
            sx={{
              '& .MuiDataGrid-cell:hover': {
                color: '#ff6b6b',
              },
            }}
          />
        </Box>

        {/* Dialog */}
        <DataRowDialog
          open={dialogOpen}
          onClose={closeDialog}
          onSave={handleSaveRow}
          editingRow={editingRow}
        />

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => {}}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

