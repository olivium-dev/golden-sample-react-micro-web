/**
 * Shared UI Library Entry Point
 * Exports theme configuration, design tokens, and common components
 */

// Theme exports
export { lightTheme, darkTheme, getTheme, createCustomTheme } from './theme';
export type { Theme, ThemeOptions } from '@mui/material/styles';

// Token exports
export * from './tokens';

// CSS Variables
export * from './theme/cssVariables';

// Components
export * from './components';

// Error handling exports
export * from './errors/types';
export { ErrorLogger } from './errors/ErrorLogger';
export { ErrorCapture } from './errors/ErrorCapture';
export { default as ErrorBoundary } from './components/ErrorBoundary';
export { default as ErrorPanel } from './components/ErrorPanel';
export { default as ErrorToast } from './components/ErrorToast';
export { useErrorMonitor } from './hooks/useErrorMonitor';

// Authentication exports
export * from './auth/types';
export { AuthProvider, AuthContext } from './auth/AuthContext';
export { useAuth } from './auth/useAuth';
export { ProtectedRoute } from './auth/ProtectedRoute';
export { authService } from './auth/AuthService';
export { default as LoginForm } from './components/LoginForm';
export { default as LoginPage } from './components/LoginPage';
export { default as UserMenu } from './components/UserMenu';
export { default as apiClient } from './api/apiClient';

// Re-export commonly used MUI components for convenience
export {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Paper,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Chip,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Alert,
  Snackbar,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  Tooltip,
  Badge,
} from '@mui/material';

// MUI Icons
export {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';

