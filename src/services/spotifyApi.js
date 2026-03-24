// Wrapper per le chiamate alla Spotify Web API (token utente OAuth).
//
// Fonti per le nuove uscite:
//   1. Playlist editoriali Spotify Italia (New Music Friday Italia, Top 50 Italy)
//   2. /search con tag:new e market=IT (supplementare)
//
// Generi artista via /artists?ids=... (batch, 50 per request).
// Retry automatici con backoff esponenziale per 429 e 5xx.

import { SPOTIFY_API_BASE } from "../utils/constants";

const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000;

async function apiFetch(endpoint, token, options = {}) {
  const url = `${SPOTIFY_API_BASE}${endpoint}`;

  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.ok) {
      return response.json();
    }

    const isRetryable = response.status === 429 || response.status >= 500;

    if (!isRetryable || attempt === RETRY_ATTEMPTS) {
      const error = new Error(
        `Spotify API error: ${response.status} ${response.statusText}`,
      );
      error.status = response.status;
      throw error;
    }

    const retryAfter = response.headers.get("Retry-After");
    const delay =
      retryAfter ?
        parseInt(retryAfter, 10) * 1000
      : RETRY_BASE_DELAY_MS * 2 ** attempt;

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

// ---------------------------------------------------------------------------
// Batch artisti e generi
// ---------------------------------------------------------------------------

/**
 * Recupera fino a 50 artisti in una singola chiamata.
 */
export async function getArtistsBatch(artistIds, token) {
  const ids = artistIds.slice(0, 50).join(",");
  const params = new URLSearchParams({ ids });
  const data = await apiFetch(`/artists?${params}`, token);
  return data.artists;
}

/**
 * Recupera i generi di tutti gli artisti presenti nelle release.
 * Usa chiamate batch (50 per request) con deduplicazione.
 */
export async function batchFetchGenres(releases, token) {
  const uniqueIds = [
    ...new Set(releases.flatMap((r) => r.artists.map((a) => a.id))),
  ];
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

// ---------------------------------------------------------------------------
// getFeaturedReleases — playlist editoriali + tag:new search
// ---------------------------------------------------------------------------

// Playlist editoriali Spotify Italia (ID stabili e pubblici)
const EDITORIAL_PLAYLIST_IDS = [
  "37i9dQZF1DWVKDF4ycOESi", // New Music Friday Italia
  "37i9dQZEVXbIQnj7RRhdSX", // Top 50 - Italy
];

const SEARCH_LIMIT = 10; // Max per request post-Feb 2026

/**
 * Recupera gli album unici da una playlist editoriale.
 * Estrae l'album da ogni traccia per deduplicare automaticamente.
 */
async function getPlaylistAlbums(playlistId, token) {
  const albumMap = new Map();
  let offset = 0;
  const limit = 50;

  while (true) {
    const params = new URLSearchParams({
      fields:
        "items(track(album(id,name,release_date,album_type,images,artists(id,name),external_urls))),total",
      market: "IT",
      limit,
      offset,
    });

    const data = await apiFetch(
      `/playlists/${playlistId}/tracks?${params}`,
      token,
    );

    for (const item of data.items ?? []) {
      const album = item?.track?.album;
      if (album?.id && !albumMap.has(album.id)) {
        albumMap.set(album.id, album);
      }
    }

    const fetched = (data.items ?? []).length;
    if (offset + fetched >= (data.total ?? 0) || fetched < limit) break;
    offset += limit;
  }

  return [...albumMap.values()];
}

/**
 * Cerca nuove uscite con tag:new (market=IT, type=album).
 */
async function searchNewReleases(token, maxResults = 100) {
  const albums = [];
  let offset = 0;

  while (albums.length < maxResults) {
    const params = new URLSearchParams({
      q: "tag:new",
      type: "album",
      market: "IT",
      limit: SEARCH_LIMIT,
      offset,
    });

    const data = await apiFetch(`/search?${params}`, token);
    const items = data.albums?.items ?? [];
    albums.push(...items);

    const total = data.albums?.total ?? 0;
    if (albums.length >= total || items.length < SEARCH_LIMIT) break;
    offset += SEARCH_LIMIT;
  }

  return albums.slice(0, maxResults);
}

/**
 * Recupera nuove uscite italiane e internazionali combinando:
 * - Playlist editoriali Spotify Italia (New Music Friday Italia, Top 50)
 * - Ricerca tag:new con market=IT
 *
 * Deduplica per album ID e arricchisce con generi artista.
 *
 * @param {string} token - Token utente OAuth Spotify
 * @returns {Promise<Array<{id, name, artists, release_date, album_type, images, external_urls, genres}>>}
 */
export async function getFeaturedReleases(token) {
  // 1. Raccogli album da playlist editoriali
  const playlistAlbums = [];
  for (const playlistId of EDITORIAL_PLAYLIST_IDS) {
    try {
      const albums = await getPlaylistAlbums(playlistId, token);
      playlistAlbums.push(...albums);
    } catch (err) {
      console.warn(`Playlist ${playlistId} non accessibile:`, err.message);
    }
  }

  // 2. Supplementa con tag:new search
  let searchAlbums = [];
  try {
    searchAlbums = await searchNewReleases(token);
  } catch (err) {
    console.warn("tag:new search fallita:", err.message);
  }

  // 3. Deduplica per album ID (playlist albums hanno priorità)
  const albumMap = new Map();
  for (const album of [...playlistAlbums, ...searchAlbums]) {
    if (album?.id && !albumMap.has(album.id)) {
      albumMap.set(album.id, album);
    }
  }

  const uniqueReleases = [...albumMap.values()];
  if (uniqueReleases.length === 0) return [];

  // 4. Arricchisci con generi artista
  const genresMap = await batchFetchGenres(uniqueReleases, token);

  return uniqueReleases.map((album) => ({
    id: album.id,
    name: album.name,
    artists: (album.artists ?? []).map((a) => ({ id: a.id, name: a.name })),
    release_date: album.release_date ?? null,
    album_type: album.album_type ?? null,
    images: album.images ?? [],
    external_urls: album.external_urls ?? {},
    genres: [
      ...new Set(
        (album.artists ?? []).flatMap((a) => genresMap.get(a.id) ?? []),
      ),
    ],
  }));
}
