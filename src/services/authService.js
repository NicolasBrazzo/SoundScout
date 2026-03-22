// Implementazione del flusso Authorization Code con PKCE per Spotify.
// Non richiede backend: il client_secret non viene mai usato.
//
// Flusso:
//   1. redirectToSpotify()   → genera verifier/challenge, redirect a Spotify
//   2. exchangeCodeForToken() → scambia il ?code= con access_token + refresh_token
//   3. refreshAccessToken()  → rinnova il token prima della scadenza
//
// I token vengono salvati in sessionStorage (cancellati alla chiusura del tab).

import { SCOPES } from '../utils/constants';

const CLIENT_ID   = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const AUTH_BASE    = 'https://accounts.spotify.com';

const TOKEN_KEY    = 'ss_access_token';
const REFRESH_KEY  = 'ss_refresh_token';
const EXPIRES_KEY  = 'ss_expires_at';
const VERIFIER_KEY = 'ss_code_verifier';

// ─── PKCE helpers ─────────────────────────────────────────────────────────────

function base64urlEncode(buffer) {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateCodeVerifier() {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}

async function generateCodeChallenge(verifier) {
  const data   = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64urlEncode(new Uint8Array(digest));
}

// ─── Token storage ────────────────────────────────────────────────────────────

function saveTokens({ access_token, refresh_token, expires_in }) {
  sessionStorage.setItem(TOKEN_KEY,   access_token);
  sessionStorage.setItem(EXPIRES_KEY, String(Date.now() + expires_in * 1000));
  if (refresh_token) sessionStorage.setItem(REFRESH_KEY, refresh_token);
}

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return sessionStorage.getItem(REFRESH_KEY);
}

export function isTokenExpired() {
  const expiresAt = parseInt(sessionStorage.getItem(EXPIRES_KEY) ?? '0', 10);
  return Date.now() >= expiresAt - 60_000; // rinfresca 60s prima della scadenza
}

export function clearTokens() {
  [TOKEN_KEY, REFRESH_KEY, EXPIRES_KEY, VERIFIER_KEY].forEach((k) =>
    sessionStorage.removeItem(k)
  );
}

// ─── Auth flow ────────────────────────────────────────────────────────────────

/**
 * Avvia il login: genera PKCE, salva il verifier, redirige a Spotify.
 */
export async function redirectToSpotify() {
  const verifier   = generateCodeVerifier();
  const challenge  = await generateCodeChallenge(verifier);
  sessionStorage.setItem(VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    client_id:             CLIENT_ID,
    response_type:         'code',
    redirect_uri:          REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge:        challenge,
    scope:                 SCOPES,
  });

  window.location.href = `${AUTH_BASE}/authorize?${params}`;
}

/**
 * Scambia il codice di autorizzazione con access_token + refresh_token.
 * @param {string} code - Il valore di ?code= dal redirect URL
 * @returns {Promise<string>} L'access_token ricevuto
 */
export async function exchangeCodeForToken(code) {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error('Code verifier non trovato in sessionStorage.');

  const response = await fetch(`${AUTH_BASE}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  REDIRECT_URI,
      client_id:     CLIENT_ID,
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error_description ?? `Token exchange fallito: ${response.status}`);
  }

  const data = await response.json();
  saveTokens(data);
  sessionStorage.removeItem(VERIFIER_KEY); // non serve più
  return data.access_token;
}

/**
 * Rinnova l'access_token usando il refresh_token salvato.
 * @returns {Promise<string>} Il nuovo access_token
 */
export async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) throw new Error('Nessun refresh token disponibile.');

  const response = await fetch(`${AUTH_BASE}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
      client_id:     CLIENT_ID,
    }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error('Refresh token scaduto o non valido.');
  }

  const data = await response.json();
  saveTokens(data);
  return data.access_token;
}
