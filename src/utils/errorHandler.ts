import Toast from 'react-native-toast-message';
import { AxiosError } from 'axios';

/**
 * Handle API errors consistently across the app
 * Suppresses error toasts for timing-related 401/403 errors
 */
export function handleApiError(error: any, defaultMessage: string = 'An error occurred'): void {
  // Don't show error toast for 401/403 if it might be a timing issue
  if (error.response?.status === 401 || error.response?.status === 403) {
    // These are handled by the API client interceptor
    // Only log in dev mode
    if (__DEV__) {
      console.warn('Auth error (may be timing issue):', error.response?.status, error.config?.url);
    }
    return;
  }

  // Show error toast for other errors
  const errorMessage = error.response?.data?.message || error.message || defaultMessage;
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: errorMessage,
  });
}
