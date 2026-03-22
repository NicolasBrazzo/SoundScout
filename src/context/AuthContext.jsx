// Contesto globale per lo stato di autenticazione Spotify.
// Al mount legge il token da sessionStorage e lo rinnova se scaduto.
// Un interval controlla ogni minuto se il token sta per scadere.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredToken,
  isTokenExpired,
  refreshAccessToken,
  clearTokens,
  redirectToSpotify,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]               = useState(null);
  const [isAuthenticated, setIsAuth]    = useState(false);
  const [isLoading, setIsLoading]       = useState(true); // true finché non controlliamo sessionStorage

  // Controlla il token salvato al primo render
  useEffect(() => {
    async function init() {
      const stored = getStoredToken();

      if (!stored) {
        setIsLoading(false);
        return;
      }

      if (isTokenExpired()) {
        try {
          const newToken = await refreshAccessToken();
          setToken(newToken);
          setIsAuth(true);
        } catch {
          clearTokens();
        }
      } else {
        setToken(stored);
        setIsAuth(true);
      }

      setIsLoading(false);
    }

    init();
  }, []);

  // Auto-refresh: controlla ogni minuto se il token sta per scadere
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      if (isTokenExpired()) {
        try {
          const newToken = await refreshAccessToken();
          setToken(newToken);
        } catch {
          setToken(null);
          setIsAuth(false);
          clearTokens();
        }
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = useCallback(() => redirectToSpotify(), []);

  const logout = useCallback(() => {
    clearTokens();
    setToken(null);
    setIsAuth(false);
  }, []);

  // Chiamato dalla CallbackPage dopo lo scambio del codice
  const handleTokenReceived = useCallback((accessToken) => {
    setToken(accessToken);
    setIsAuth(true);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, isLoading, login, logout, handleTokenReceived }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
