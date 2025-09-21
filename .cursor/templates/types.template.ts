// TypeScript type definitions template for micro-frontend applications

// Remote module declarations
declare module "auth/AuthPage" {
  const AuthPage: React.ComponentType<any>;
  export default AuthPage;
}

declare module "dashboard/DashboardPage" {
  const DashboardPage: React.ComponentType<any>;
  export default DashboardPage;
}

declare module "profile/ProfilePage" {
  const ProfilePage: React.ComponentType<any>;
  export default ProfilePage;
}

// Common interfaces for micro-frontend communication

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profilePublic: boolean;
    showEmail: boolean;
    showActivity: boolean;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface DashboardData {
  stats: {
    totalUsers: number;
    revenue: number;
    growth: number;
    orders: number;
  };
  charts: {
    revenue: Array<{ date: string; amount: number }>;
    userGrowth: Array<{ month: string; users: number }>;
    topProducts: Array<{ name: string; sales: number }>;
  };
  recentActivity: Array<{
    id: string;
    type: 'user_signup' | 'order_placed' | 'payment_received';
    description: string;
    timestamp: Date;
    user?: string;
    amount?: number;
  }>;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  avatar?: File | string;
  preferences: UserPreferences;
}

// Event types for inter-app communication
export interface MicroFrontendEvent<T = any> {
  type: string;
  payload: T;
  source: string;
  timestamp: Date;
}

export interface AuthEvents {
  LOGIN_SUCCESS: { user: User; token: string };
  LOGOUT: { userId: string };
  PROFILE_UPDATED: { user: User };
  PASSWORD_CHANGED: { userId: string };
}

export interface NavigationEvents {
  ROUTE_CHANGED: { from: string; to: string };
  BREADCRUMB_UPDATE: { items: BreadcrumbItem[] };
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  active?: boolean;
}

// Error handling types
export interface RemoteAppError {
  appName: string;
  componentName: string;
  error: Error;
  timestamp: Date;
  userAgent: string;
  url: string;
}

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Form validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select' | 'file';
  placeholder?: string;
  validation?: ValidationRule;
  options?: Array<{ value: string; label: string }>;
}

export interface FormErrors {
  [fieldName: string]: string;
}

// Theme and styling types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

// Configuration types
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    [featureName: string]: boolean;
  };
  remotes: {
    [remoteName: string]: {
      url: string;
      scope: string;
      module: string;
    };
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Global window extensions for micro-frontend communication
declare global {
  interface Window {
    __MICRO_FRONTEND_SHARED_STATE__?: any;
    __WEBPACK_SHARE_SCOPES__?: any;
    __webpack_require__?: any;
  }
}
