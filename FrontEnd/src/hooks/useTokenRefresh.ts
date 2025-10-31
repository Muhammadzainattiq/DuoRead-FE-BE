import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to handle automatic token refresh and expiration warnings
 */
export const useTokenRefresh = () => {
  const { token, refreshToken, refreshAccessToken, logout } = useAuth();
  const warningShown = useRef(false);

  useEffect(() => {
    if (!token) return;

    // Function to check token expiration
    const checkTokenExpiration = () => {
      try {
        // Decode JWT token to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const expirationTime = payload.exp;
        const timeUntilExpiry = expirationTime - currentTime;

        // Show warning 5 minutes before expiration
        if (timeUntilExpiry <= 300 && timeUntilExpiry > 0 && !warningShown.current) {
          warningShown.current = true;
          console.log('Token expires in 5 minutes, refreshing...');
          
          // Automatically refresh token
          refreshAccessToken().then((success) => {
            if (success) {
              console.log('Token refreshed successfully');
              warningShown.current = false;
            } else {
              console.log('Token refresh failed, user will be logged out');
            }
          });
        }

        // If token is already expired, try to refresh
        if (timeUntilExpiry <= 0) {
          console.log('Token expired, attempting refresh...');
          refreshAccessToken().then((success) => {
            if (!success) {
              console.log('Token refresh failed, logging out user');
              logout();
            }
          });
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => {
      clearInterval(interval);
      warningShown.current = false;
    };
  }, [token, refreshToken, refreshAccessToken, logout]);
};
