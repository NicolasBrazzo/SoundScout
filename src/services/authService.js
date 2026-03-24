// OAuth Authorization Code + PKCE per Spotify.
// Tutto il flow avviene nel browser, non serve client_secret.
//
// Flusso:
//   1. login() → genera PKCE challenge, redirect a Spotify
//   2. Spotify redirect → /callback?code=...
//   3. handleCallback() → scambia code per access_token + refresh_token
//   4. refreshAccessToken() → rinnova token scaduto
//   5. logout() → pulisce tutto

const CLIENT_ID = "3e5fe8552ead47aa9ba7188e322e705f";
const REDIRECT_URI = window.location.origin + "/callback";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

// Nessuno scope necessario: i dati pubblici (playlist, artisti, search)
// sono accessibili senza scope aggiuntivi.
const SCOPES = "";

const STORAGE_KEYS = {
  refreshToken: "soundscout_refresh_token",
  codeVerifier: "soundscout_code_verifier",
};

// Token in memoria (non persistito — si rinnova via refresh_token)
let accessToken = null;
let tokenExpiresAt = 0;

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => possible[v % possible.length]).join("");
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(plain));
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ---------------------------------------------------------------------------
// Auth flow
// ---------------------------------------------------------------------------

/**
 * Avvia il login: genera PKCE verifier/challenge e redirect a Spotify.
 */
export async function login() {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hashed);

  sessionStorage.setItem(STORAGE_KEYS.codeVerifier, codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    scope: SCOPES,
  });

  window.location.href = `${AUTH_ENDPOINT}?${params}`;
}

/**
 * Gestisce il callback dopo il redirect da Spotify.
 * Scambia il code per access_token + refresh_token.
 * Pulisce l'URL e restituisce l'access_token.
 */
export async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const error = params.get("error");

  if (error) {
    throw new Error(`Spotify auth error: ${error}`);
  }

  if (!code) {
    throw new Error("Nessun codice di autorizzazione nell'URL.");
  }

  const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.codeVerifier);
  if (!codeVerifier) {
    throw new Error("Code verifier mancante. Riprova il login.");
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange fallito: ${response.status}`);
  }

  const data = await response.json();
  storeTokens(data);

  // Pulisci URL e sessionStorage
  sessionStorage.removeItem(STORAGE_KEYS.codeVerifier);
  window.history.replaceState({}, document.title, "/");

  return data.access_token;
}

/**
 * Rinnova l'access_token usando il refresh_token.
 * Restituisce { access_token, expires_in }.
 */
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  if (!refreshToken) {
    throw new Error("Nessun refresh token. Effettua il login.");
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });

  if (!response.ok) {
    // Refresh token invalido — forza re-login
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    accessToken = null;
    tokenExpiresAt = 0;
    throw new Error("Sessione scaduta. Effettua nuovamente il login.");
  }

  const data = await response.json();
  storeTokens(data);

  return { access_token: data.access_token, expires_in: data.expires_in };
}

/**
 * Logout: cancella token in memoria e localStorage.
 */
export function logout() {
  accessToken = null;
  tokenExpiresAt = 0;
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  window.location.href = "/";
}

/**
 * Controlla se l'utente ha un refresh_token salvato.
 */
export function isLoggedIn() {
  return localStorage.getItem(STORAGE_KEYS.refreshToken) !== null;
}

/**
 * Restituisce l'access_token corrente (può essere null se scaduto).
 */
export function getAccessToken() {
  if (Date.now() < tokenExpiresAt) {
    return accessToken;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function storeTokens(data) {
  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  // Spotify può restituire un nuovo refresh_token
  if (data.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
  }
}
