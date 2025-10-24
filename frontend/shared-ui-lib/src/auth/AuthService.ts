/**
 * Authentication Service - Singleton for managing authentication state
 */
import apiClient from '../api/apiClient';
import { User, LoginCredentials, TokenResponse } from './types';

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
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    try {
      const response = await apiClient.post<TokenResponse>('/auth/login', credentials);
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
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await apiClient.post('/auth/logout', {
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
      const response = await apiClient.get<User>('/auth/me');
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
      const response = await apiClient.post<TokenResponse>('/auth/refresh', {
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





