// Hook di convenienza che espone le funzioni di autenticazione Spotify.
// Wrapper sottile su useAuth() — tutta la logica vive in AuthContext.

import { useAuth } from '../context/AuthContext';

/**
 * @returns {{
 *   token: string|null,
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   login: () => void,
 *   logout: () => void,
 * }}
 */
export function useSpotifyAuth() {
  const { token, isAuthenticated, isLoading, login, logout } = useAuth();
  return { token, isAuthenticated, isLoading, login, logout };
}
