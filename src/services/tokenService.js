// Gestisce il token Spotify lato frontend.
// Usa il token utente OAuth (da authService) con auto-refresh.

import { getAccessToken, refreshAccessToken } from './authService';

let cached = null; // { token: string, expiresAt: number }

export async function getToken() {
  // Token in memoria ancora valido (con 60s di margine)
  if (cached && Date.now() < cached.expiresAt - 60_000) {
    return cached.token;
  }

  // Token OAuth già disponibile in authService
  const existing = getAccessToken();
  if (existing) {
    return existing;
  }

  // Rinnova via refresh_token
  const { access_token, expires_in } = await refreshAccessToken();
  cached = { token: access_token, expiresAt: Date.now() + expires_in * 1000 };
  return cached.token;
}

export function clearTokenCache() {
  cached = null;
}
