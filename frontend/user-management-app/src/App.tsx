import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Snackbar,
  Alert,
  Chip,
  InputAdornment,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { User, fetchAllUsers, searchUsers } from './api';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    console.log('🔄 App: Starting to fetch users...');
    setLoading(true);
    try {
      const response = await fetchAllUsers({ skip: 0, limit: 50 });
      console.log('✅ App: Received users response:', response);
      setUsers(response.users);
      console.log('✅ App: Users state updated with', response.users.length, 'users');
    } catch (error: any) {
      console.error('❌ App: Error fetching users:', error.message);
      // If API fails, set empty array to prevent .filter() error
      setUsers([]);
      showSnackbar(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      console.log('✅ App: Loading state set to false');
    }
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  const columns: GridColDef[] = [
    { field: 'userId', headerName: 'User ID', width: 200 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'profilePic',
      headerName: 'Profile Picture',
      width: 120,
      renderCell: (params) => (
        params.value ? (
          <Chip
            label="📷"
            size="small"
            color="primary"
            title="Has profile picture"
          />
        ) : (
          <Chip
            label="No Image"
            size="small"
            color="default"
          />
        )
      ),
    },
    {
      field: 'dateOfBirth',
      headerName: 'Date of Birth',
      width: 130,
      renderCell: (params) => (
        params.value ? (
          <span>{new Date(params.value).toLocaleDateString()}</span>
        ) : (
          <span style={{ color: '#999' }}>Not provided</span>
        )
      ),
    },
    {
      field: 'createdDate',
      headerName: 'Created Date',
      width: 150,
      renderCell: (params) => (
        <span>{new Date(params.value).toLocaleDateString()}</span>
      ),
    },
  ];

  // Search users with debouncing
  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (!searchQuery.trim()) {
        // If no search query, just fetch all users
        fetchUsers();
        return;
      }

      setLoading(true);
      try {
        const searchResults = await searchUsers(searchQuery, { skip: 0, limit: 50 });
        setUsers(searchResults);
      } catch (error) {
        setUsers([]);
        showSnackbar('Error searching users', 'error');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(searchUsersDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Debug logging
  console.log('🔍 App render - Current state:', {
    usersCount: users.length,
    loading,
    searchQuery,
    hasUsers: users.length > 0
  });

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: '#61dafb' }}>
              👥 User Management - View Only
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View user profiles and information (Read-only mode)
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search users..."
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
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
          >
            Refresh
          </Button>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row) => row.userId}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:hover': {
                color: '#61dafb',
              },
            }}
          />
        </Box>
      </Box>


      {/* Snackbar */}
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
    </Container>
  );
}

export default App;
