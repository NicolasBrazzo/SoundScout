import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './pages/Dashboard';
import { isLoggedIn, handleCallback, refreshAccessToken } from './services/authService';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function initAuth() {
      const params = new URLSearchParams(window.location.search);
      if (params.has('code')) {
        if (ignore) return;
        try {
          await handleCallback();
          setAuthenticated(true);
        } catch (err) {
          // Se il code è già stato usato (StrictMode doppia esecuzione),
          // controlla se abbiamo comunque un refresh_token valido
          if (isLoggedIn()) {
            setAuthenticated(true);
          } else {
            console.error('Auth callback fallito:', err);
          }
        }
      } else if (isLoggedIn()) {
        setAuthenticated(true);
        try {
          await refreshAccessToken();
        } catch (err) {
          console.error('Refresh token fallito:', err);
          setAuthenticated(false);
        }
      }
      setAuthLoading(false);
    }
    initAuth();
    return () => { ignore = true; };
  }, []);

  if (authLoading) return null;
  if (!authenticated) return <LoginScreen />;
  return <Dashboard />;
}
