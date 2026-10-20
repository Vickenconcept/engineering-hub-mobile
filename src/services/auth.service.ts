import apiClient, { extractData, ApiResponse } from '../lib/api-client';
import { storage } from '../lib/storage';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const authData = extractData<AuthResponse>(response);
    
    // Store token and user
    await storage.setToken(authData.token);
    await storage.setUser(authData.user);
    
    return authData;
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const authData = extractData<AuthResponse>(response);
    
    // Store token and user
    await storage.setToken(authData.token);
    await storage.setUser(authData.user);
    
    return authData;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse>('/auth/logout');
    } catch (error: any) {
      // 401 errors are expected if token is expired/invalid - don't log them
      // Other errors might be network issues, but we still want to clear local auth
      if (error.response?.status !== 401) {
        console.error('Logout error:', error);
      }
    } finally {
      // Always remove token and user from storage, even if API call fails
      await storage.clearAuth();
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    const user = extractData<User>(response);
    
    // Update stored user data
    await storage.setUser(user);
    
    return user;
  },

  /**
   * Check if user is authenticated
   * Returns true if token exists, without making API call (for faster initial load)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await storage.getToken();
    return !!token;
  },

  /**
   * Verify authentication by making API call
   */
  async verifyAuth(): Promise<boolean> {
    const token = await storage.getToken();
    if (!token) {
      return false;
    }
    
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      await storage.clearAuth();
      return false;
    }
  },
};
