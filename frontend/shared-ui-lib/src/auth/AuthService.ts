/**
 * Authentication Service - Singleton for managing authentication state
 */
import apiClient from '../api/apiClient';
import { User, LoginCredentials, TokenResponse } from './types';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword as firebaseSignInWithEmail,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmail,
  signOut as firebaseSignOut
} from './firebaseConfig';
import { SocialLoginResponse } from './firebaseTypes';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AuthService {
  private static instance: AuthService;
  private refreshTimer: NodeJS.Timeout | null = null;
  private broadcastChannel: BroadcastChannel | null = null;

  private constructor() {
    // Initialize BroadcastChannel for cross-tab communication
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('auth_channel');
      this.setupBroadcastListener();
    }

    // Listen for auth events
    this.setupEventListeners();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private setupBroadcastListener(): void {
    if (!this.broadcastChannel) return;

    this.broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'LOGOUT') {
        this.handleLogoutEvent();
      } else if (event.data.type === 'LOGIN') {
        this.handleLoginEvent(event.data.tokens);
      }
    };
  }

  private setupEventListeners(): void {
    window.addEventListener('auth:logout', () => {
      this.handleLogoutEvent();
    });

    window.addEventListener('auth:token-refreshed', () => {
      this.scheduleTokenRefresh();
    });
  }

  /**
   * Login user with credentials (traditional email/password)
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    try {
      // Use the BFF endpoint for authentication
      const response = await apiClient.post<TokenResponse>('/api/users/login', credentials);
      const tokens = response.data;

      // Store tokens
      this.storeTokens(tokens);

      // Schedule automatic token refresh
      this.scheduleTokenRefresh();

      // Broadcast login to other tabs
      this.broadcastMessage({ type: 'LOGIN', tokens });

      return tokens;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  }

  /**
   * Login with Google using Firebase
   */
  async loginWithGoogle(): Promise<TokenResponse> {
    try {
      console.log('🔐 Starting Google Sign-In...');
      
      // 1. Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('✅ Firebase Google Sign-In successful:', user.email);
      
      // 2. Get Firebase ID token
      const idToken = await user.getIdToken();
      
      console.log('🎫 Firebase ID token obtained');
      
      // 3. Send Firebase token to BFF for verification
      const response = await apiClient.post<SocialLoginResponse>('/api/users/social', {
        socialId: user.uid,
        socialToken: idToken,
        socialPlatform: 'google'
      });
      
      console.log('✅ Backend authentication successful');
      
      // 4. Map response to TokenResponse format
      const tokens: TokenResponse = {
        access_token: response.data.authToken,
        refresh_token: response.data.refreshToken,
      };

      // Store tokens
      this.storeTokens(tokens);

      // Schedule automatic token refresh
      this.scheduleTokenRefresh();

      // Broadcast login to other tabs
      this.broadcastMessage({ type: 'LOGIN', tokens });

      return tokens;
    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      
      // Handle Firebase errors
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            throw new Error('Sign-in cancelled');
          case 'auth/popup-blocked':
            throw new Error('Popup blocked by browser. Please allow popups for this site.');
          case 'auth/cancelled-popup-request':
            throw new Error('Sign-in cancelled');
          default:
            throw new Error(error.message || 'Google Sign-In failed');
        }
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Google Sign-In failed');
    }
  }

  /**
   * Login with Email/Password using Firebase
   */
  async loginWithEmailPassword(email: string, password: string): Promise<TokenResponse> {
    try {
      console.log('🔐 Starting Firebase Email/Password Sign-In...');
      
      // 1. Sign in with Firebase
      const userCredential = await firebaseSignInWithEmail(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase Email Sign-In successful:', user.email);
      
      // 2. Get Firebase ID token
      const idToken = await user.getIdToken();
      
      console.log('🎫 Firebase ID token obtained');
      
      // 3. Send Firebase token to BFF for verification
      const response = await apiClient.post<SocialLoginResponse>('/api/users/social', {
        socialId: user.uid,
        socialToken: idToken,
        socialPlatform: 'email'
      });
      
      console.log('✅ Backend authentication successful');
      
      // 4. Map response to TokenResponse format
      const tokens: TokenResponse = {
        access_token: response.data.authToken,
        refresh_token: response.data.refreshToken,
      };

      // Store tokens
      this.storeTokens(tokens);

      // Schedule automatic token refresh
      this.scheduleTokenRefresh();

      // Broadcast login to other tabs
      this.broadcastMessage({ type: 'LOGIN', tokens });

      return tokens;
    } catch (error: any) {
      console.error('❌ Email/Password Sign-In error:', error);
      
      // Handle Firebase errors
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            throw new Error('User not found. Please register first.');
          case 'auth/wrong-password':
            throw new Error('Incorrect password');
          case 'auth/invalid-email':
            throw new Error('Invalid email address');
          case 'auth/user-disabled':
            throw new Error('Account has been disabled');
          case 'auth/too-many-requests':
            throw new Error('Too many failed attempts. Please try again later.');
          default:
            throw new Error(error.message || 'Email/Password Sign-In failed');
        }
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Email/Password Sign-In failed');
    }
  }

  /**
   * Register with Email/Password using Firebase
   */
  async registerWithEmailPassword(email: string, password: string, username?: string): Promise<TokenResponse> {
    try {
      console.log('📝 Starting Firebase Email/Password Registration...');
      
      // 1. Create user with Firebase
      const userCredential = await firebaseCreateUserWithEmail(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase user created:', user.email);
      
      // 2. Get Firebase ID token
      const idToken = await user.getIdToken();
      
      console.log('🎫 Firebase ID token obtained');
      
      // 3. Send Firebase token to BFF for verification and user creation
      const response = await apiClient.post<SocialLoginResponse>('/api/users/social', {
        socialId: user.uid,
        socialToken: idToken,
        socialPlatform: 'email'
      });
      
      console.log('✅ Backend user registration successful');
      
      // 4. Map response to TokenResponse format
      const tokens: TokenResponse = {
        access_token: response.data.authToken,
        refresh_token: response.data.refreshToken,
      };

      // Store tokens
      this.storeTokens(tokens);

      // Schedule automatic token refresh
      this.scheduleTokenRefresh();

      // Broadcast login to other tabs
      this.broadcastMessage({ type: 'LOGIN', tokens });

      return tokens;
    } catch (error: any) {
      console.error('❌ Email/Password Registration error:', error);
      
      // Handle Firebase errors
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            throw new Error('Email already registered. Please login instead.');
          case 'auth/invalid-email':
            throw new Error('Invalid email address');
          case 'auth/weak-password':
            throw new Error('Password is too weak. Use at least 6 characters.');
          case 'auth/operation-not-allowed':
            throw new Error('Email/Password registration is not enabled');
          default:
            throw new Error(error.message || 'Registration failed');
        }
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await apiClient.post('/api/users/logout', {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
      this.stopTokenRefresh();

      // Broadcast logout to other tabs
      this.broadcastMessage({ type: 'LOGOUT' });
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/api/users/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to get user info');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post<TokenResponse>('/api/users/refresh', {
        refresh_token: refreshToken,
      });

      const tokens = response.data;
      this.storeTokens(tokens);
      this.scheduleTokenRefresh();
    } catch (error: any) {
      this.clearTokens();
      throw new Error(error.response?.data?.detail || 'Token refresh failed');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Store tokens in localStorage
   */
  private storeTokens(tokens: TokenResponse): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  /**
   * Clear tokens from localStorage
   */
  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Schedule automatic token refresh (13 minutes before expiry)
   * Access tokens expire in 15 minutes, so refresh at 13 minutes
   */
  private scheduleTokenRefresh(): void {
    this.stopTokenRefresh();

    // Refresh token 2 minutes before expiry (13 minutes)
    const refreshInterval = 13 * 60 * 1000; // 13 minutes in milliseconds

    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Auto token refresh failed:', error);
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }, refreshInterval);
  }

  /**
   * Stop automatic token refresh
   */
  private stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Broadcast message to other tabs
   */
  private broadcastMessage(message: any): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    }
  }

  /**
   * Handle logout event from other tabs
   */
  private handleLogoutEvent(): void {
    this.clearTokens();
    this.stopTokenRefresh();
    window.location.href = '/login';
  }

  /**
   * Handle login event from other tabs
   */
  private handleLoginEvent(tokens: TokenResponse): void {
    this.storeTokens(tokens);
    this.scheduleTokenRefresh();
  }
}

export const authService = AuthService.getInstance();
export default authService;





