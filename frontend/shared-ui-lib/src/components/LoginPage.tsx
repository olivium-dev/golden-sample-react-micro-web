/**
 * Complete Login Page Layout Component
 */
import React from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import { LockOutlined, Info } from '@mui/icons-material';
import { useAuth } from '../auth/useAuth';
import { LoginForm } from './LoginForm';
import { LoginCredentials } from '../auth/types';

export const LoginPage: React.FC = () => {
  const { login, error, isLoading } = useAuth();

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    try {
      await login(credentials);
      // No navigation needed - the App component will automatically show the main app
      // when isAuthenticated becomes true
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login failed:', error);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card
          elevation={3}
          sx={{
            width: '100%',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar
                sx={{
                  m: 1,
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                }}
              >
                <LockOutlined />
              </Avatar>

              <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
                Sign In
              </Typography>

              <Typography variant="body2" color="text.secondary" align="center">
                Micro-Frontend Authentication
              </Typography>
            </Box>

            <LoginForm onSubmit={handleLogin} error={error} isLoading={isLoading} />

            {/* Demo Users Info */}
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Info color="info" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary">
                  Demo Users
                </Typography>
              </Stack>

              <Stack spacing={1}>
                <Box>
                  <Chip
                    label="Admin"
                    size="small"
                    color="error"
                    sx={{ mr: 1, mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    admin@example.com / admin123
                  </Typography>
                </Box>

                <Box>
                  <Chip
                    label="User"
                    size="small"
                    color="primary"
                    sx={{ mr: 1, mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    user@example.com / user123
                  </Typography>
                </Box>

                <Box>
                  <Chip
                    label="Viewer"
                    size="small"
                    color="success"
                    sx={{ mr: 1, mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    viewer@example.com / viewer123
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Micro-Frontend Golden Sample © 2024
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;





