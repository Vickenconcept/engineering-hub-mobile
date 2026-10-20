import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from './storage';
import Toast from 'react-native-toast-message';
import { ApiResponse } from '../types';

/**
 * API Client Configuration
 */
// Get API base URL from environment variable
// In Expo, environment variables need EXPO_PUBLIC_ prefix
// For development, use your local IP address
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.145.150.48:8000/api';


/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request interceptor - Add auth token to headers and log requests
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Wait for token to be available (with timeout for timing issues after login)
    let token = await storage.getToken();
    
    // If no token, wait a bit and retry (handles timing issues after login)
    if (!token && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
      // Wait up to 1000ms for token to be stored (increased from 500ms)
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        token = await storage.getToken();
        if (token) break;
      }
    }
    
    // Always ensure headers object exists
    if (!config.headers) {
      config.headers = {} as any;
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Minimal logging - only log errors
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle standard response format and errors
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    // Handle network errors
    if (!error.response) {
      const errorMessage = error.message || 'Network request failed';
      
      if (__DEV__) {
        console.error('Network Error:', errorMessage);
      }
      
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: `Failed to connect to: ${error.config?.url || 'API'}. Please check your connection.`,
      });
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const isLogoutEndpoint = error.config?.url?.includes('/auth/logout');

    // Handle 401 Unauthorized - Clear token and redirect to login
    // Don't show error toast for logout endpoint (401 is expected if token expired)
    if (status === 401) {
      await storage.clearAuth();
      // Don't show error toast for logout - it's expected if token is expired
      if (!isLogoutEndpoint) {
        // Navigation will be handled by the app for other 401 errors
      }
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (status === 403) {
      // Check if token exists - if it does, might be a timing issue
      const token = await storage.getToken();
      if (token && error.config) {
        // Token exists but got 403 - might be timing issue after login
        // Retry the request once after a short delay
        const retryCount = (error.config as any).__retryCount || 0;
        if (retryCount < 2) {
          // Wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mark this as a retry
          (error.config as any).__retryCount = retryCount + 1;
          
          // Ensure token is attached for retry
          error.config.headers = error.config.headers || {};
          error.config.headers.Authorization = `Bearer ${token}`;
          
          // Retry the request
          try {
            return await apiClient.request(error.config);
          } catch (retryError) {
            // If retry also fails, continue with normal error handling
            if (__DEV__) {
              console.warn('403 retry also failed:', error.config?.url);
            }
          }
        }
        
        // Don't show error toast for potential timing issues
        if (__DEV__) {
          console.warn('403 error with token present - may be timing issue:', error.config?.url);
        }
      } else {
        // No token - real permission issue
        Toast.show({
          type: 'error',
          text1: 'Access Denied',
          text2: data?.message || 'You do not have permission to perform this action.',
        });
      }
      return Promise.reject(error);
    }

    // Handle 422 Validation Errors
    if (status === 422 && data?.errors) {
      const firstError = Object.values(data.errors)[0]?.[0];
      if (firstError) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: firstError,
        });
      }
      return Promise.reject(error);
    }

    // Handle other errors with message from backend
    if (data?.message) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: data.message,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred. Please try again.',
      });
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to extract data from standard API response
 */
export function extractData<T>(response: { data: ApiResponse<T> }): T {
  if (response.data.success && response.data.data !== undefined) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Invalid response format');
}

/**
 * Helper function to extract message from standard API response
 */
export function extractMessage(response: { data: ApiResponse }): string {
  return response.data.message || 'Operation completed';
}

/**
 * Helper function to extract errors from standard API response
 */
export function extractErrors(response: { data: ApiResponse }): Record<string, string[]> {
  return response.data.errors || {};
}

/**
 * Helper function to extract meta from standard API response
 */
export function extractMeta(response: { data: ApiResponse }): Record<string, any> {
  return response.data.meta || {};
}

export default apiClient;
