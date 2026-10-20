import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';

/**
 * Hook to ensure authentication token is available before making API calls
 * Returns true when token is ready, false otherwise
 */
export function useAuthReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      // Wait a bit to ensure token is stored after login
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const token = await storage.getToken();
      setIsReady(!!token);
    };

    checkToken();
    
    // Also check periodically in case token is being stored
    const interval = setInterval(async () => {
      const token = await storage.getToken();
      if (token && !isReady) {
        setIsReady(true);
        clearInterval(interval);
      }
    }, 200);

    // Clear interval after 3 seconds (max wait time)
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isReady]);

  return isReady;
}
