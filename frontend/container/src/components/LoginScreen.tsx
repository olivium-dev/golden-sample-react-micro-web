import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Avatar,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  PersonOutline as PersonIcon,
  Google as GoogleIcon,
} from '@mui/icons-material';
import { authService } from '../../../shared-ui-lib/src';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, loading = false, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Login failed');
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setIsGoogleLoading(true);

    try {
      console.log('🚀 Initiating Google Sign-In...');
      await authService.loginWithGoogle();
      console.log('✅ Google Sign-In successful, reloading page...');
      // Force page reload to update authentication state
      window.location.reload();
    } catch (err: any) {
      console.error('❌ Google Sign-In failed:', err);
      setLocalError(err.message || 'Google Sign-In failed');
      setIsGoogleLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={10}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: 4,
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto 16px',
                background: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <LockIcon sx={{ fontSize: 40, color: 'white' }} />
            </Avatar>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              JAIKER Platform
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mt: 1 }}>
              Micro-Frontend Management System
            </Typography>
          </Box>

          <CardContent sx={{ padding: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
              Sign In
            </Typography>

            {(error || localError) && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error || localError}
              </Alert>
            )}

            {/* Google Sign-In Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleSignIn}
              disabled={loading || isGoogleLoading}
              startIcon={isGoogleLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
              sx={{
                mb: 2,
                height: 56,
                borderColor: '#4285F4',
                color: '#4285F4',
                '&:hover': {
                  borderColor: '#357ae8',
                  backgroundColor: 'rgba(66, 133, 244, 0.04)',
                },
              }}
            >
              {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
                autoFocus
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || isGoogleLoading}
                sx={{
                  height: 56,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In with Email'}
              </Button>
            </form>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                <strong>Sign in with:</strong>
              </Typography>
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                • Google Account (click "Continue with Google" above)
              </Typography>
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                • Email/Password using Firebase authentication
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2, fontStyle: 'italic' }}>
                Note: First-time Google users will be automatically registered
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography
          variant="body2"
          sx={{ textAlign: 'center', mt: 3, color: 'white' }}
        >
          Powered by Micro-Frontend Architecture | Secure & Scalable
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginScreen;

