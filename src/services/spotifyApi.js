// Wrapper per le chiamate alla Spotify Web API.
// Funzioni esposte:
//   - getNewReleases / getAllNewReleases: nuove uscite con paginazione automatica
//   - getArtistsBatch: recupera fino a 50 artisti in una singola chiamata
//   - batchFetchGenres: recupera i generi di tutti gli artisti di un set di release
// Internamente usa apiFetch, che aggiunge l'header Authorization e gestisce
// i retry automatici con backoff esponenziale in caso di rate limit (429) o errori server (5xx).

import { SPOTIFY_API_BASE } from '../utils/constants';

const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000;

async function apiFetch(endpoint, token, options = {}) {
  const url = `${SPOTIFY_API_BASE}${endpoint}`;

  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.ok) {
      return response.json();
    }

    const isRetryable = response.status === 429 || response.status >= 500;

    if (!isRetryable || attempt === RETRY_ATTEMPTS) {
      const error = new Error(`Spotify API error: ${response.status} ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    // Rispetta l'header Retry-After se presente (rate limit)
    const retryAfter = response.headers.get('Retry-After');
    const delay = retryAfter
      ? parseInt(retryAfter, 10) * 1000
      : RETRY_BASE_DELAY_MS * 2 ** attempt;

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export async function getNewReleases(token, market = 'IT', offset = 0, limit = 50) {
  const params = new URLSearchParams({ market, limit, offset });
  return apiFetch(`/browse/new-releases?${params}`, token);
}

/**
 * Recupera fino a 50 artisti in una singola chiamata (endpoint batch).
 * @param {string[]} artistIds
 * @param {string} token
 * @returns {Promise<Array>}
 */
export async function getArtistsBatch(artistIds, token) {
  const ids = artistIds.slice(0, 50).join(',');
  const params = new URLSearchParams({ ids });
  const data = await apiFetch(`/artists?${params}`, token);
  return data.artists;
}

/**
 * Recupera i generi di tutti gli artisti presenti nelle release.
 * Usa chiamate batch (50 artisti per request) e deduplicazione per minimizzare le API call.
 * @param {Array} releases - Array di album dalla Spotify API
 * @param {string} token
 * @returns {Promise<Map<string, string[]>>} Map artistId → genres[]
 */
export async function batchFetchGenres(releases, token) {
  const uniqueIds = [...new Set(releases.flatMap((r) => r.artists.map((a) => a.id)))];
  const genresMap = new Map();

  for (let i = 0; i < uniqueIds.length; i += 50) {
    const chunk = uniqueIds.slice(i, i + 50);
    const artists = await getArtistsBatch(chunk, token);
    artists.forEach((artist) => {
      if (artist) genresMap.set(artist.id, artist.genres ?? []);
    });
  }

  return genresMap;
}

export async function getAllNewReleases(token, market = 'IT') {
  const allReleases = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const data = await getNewReleases(token, market, offset, limit);
    const { items, total } = data.albums;

    allReleases.push(...items);

    if (allReleases.length >= total || items.length < limit) {
      break;
    }

    offset += limit;
  }

  return allReleases;
}
