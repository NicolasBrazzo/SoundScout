// Servizio per recuperare artisti dall'API di Spotify.
// Endpoint docs: https://developer.spotify.com/documentation/web-api

import { getToken } from './tokenService';

const BASE_URL = 'https://api.spotify.com/v1';

// --- Helper per chiamate autenticate ---

async function fetchSpotify(endpoint) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
  return res.json();
}

// --- Artisti seguiti dall'utente ---
// GET /me/following?type=artist
// Restituisce gli artisti che l'utente segue (paginati, max 50 per richiesta).

export async function getFollowedArtists(limit = 20) {
  // TODO: implementare paginazione con cursor (after) per caricare tutti
  const data = await fetchSpotify(`/me/following?type=artist&limit=${limit}`);
  return data.artists.items; // Array di oggetti Artist
}

// --- Top artisti dell'utente ---
// GET /me/top/artists
// Restituisce gli artisti più ascoltati dall'utente in un periodo di tempo.

export async function getTopArtists(timeRange = 'medium_term', limit = 20) {
  // timeRange: 'short_term' (4 settimane), 'medium_term' (6 mesi), 'long_term' (anni)
  const data = await fetchSpotify(`/me/top/artists?time_range=${timeRange}&limit=${limit}`);
  return data.items; // Array di oggetti Artist
}

// --- Cerca artisti per nome ---
// GET /search?type=artist&q=...
// Cerca artisti nel catalogo Spotify.

export async function searchArtists(query, limit = 20) {
  const q = encodeURIComponent(query);
  const data = await fetchSpotify(`/search?q=${q}&type=artist&limit=${limit}`);
  return data.artists.items; // Array di oggetti Artist
}

// --- Dettaglio singolo artista ---
// GET /artists/{id}

export async function getArtist(artistId) {
  return fetchSpotify(`/artists/${artistId}`);
}

// --- Artisti correlati ---
// GET /artists/{id}/related-artists

export async function getRelatedArtists(artistId) {
  const data = await fetchSpotify(`/artists/${artistId}/related-artists`);
  return data.artists; // Array di oggetti Artist
}

export async function getArtistAlbums(artistId, limit = 10) {
  const data = await fetchSpotify(`/artists/${artistId}/albums?limit=${limit}`);
  return data.items.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
}
