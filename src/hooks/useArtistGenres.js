// Hook che recupera i generi degli artisti per un set di release.
// Usa una cache in-memory (Map) per evitare fetch duplicate nella stessa sessione.
// Restituisce genresByArtistId (Map) e allGenres (array ordinato, "Altro" sempre in fondo).

import { useState, useEffect, useRef } from 'react';
import { batchFetchGenres } from '../services/spotifyApi';
import { getToken } from '../services/tokenService';

// Cache globale — persiste per tutta la sessione senza re-fetch
const genresCache = new Map();

export function useArtistGenres(releases) {
  const [genresByArtistId, setGenresByArtistId] = useState(new Map());
  const [allGenres, setAllGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const prevReleaseIds = useRef('');

  useEffect(() => {
    if (releases.length === 0) return;

    // Evita re-fetch se le release non sono cambiate
    const releaseIds = releases.map((r) => r.id).join(',');
    if (releaseIds === prevReleaseIds.current) return;
    prevReleaseIds.current = releaseIds;

    // Separa artisti già in cache da quelli da fetchare
    const allArtistIds = [...new Set(releases.flatMap((r) => r.artists.map((a) => a.id)))];
    const uncachedIds = allArtistIds.filter((id) => !genresCache.has(id));

    async function fetchMissing() {
      setLoading(true);

      if (uncachedIds.length > 0) {
        const token = await getToken();
        const uncachedReleases = releases.filter((r) =>
          r.artists.some((a) => uncachedIds.includes(a.id))
        );
        const newEntries = await batchFetchGenres(uncachedReleases, token);
        newEntries.forEach((genres, id) => genresCache.set(id, genres));
      }

      // Costruisce la mappa completa dalla cache
      const merged = new Map(allArtistIds.map((id) => [id, genresCache.get(id) ?? []]));
      setGenresByArtistId(merged);

      // Lista generi unici ordinati alfabeticamente, "Altro" sempre in fondo
      const genreSet = new Set();
      let hasUnknown = false;
      merged.forEach((genres) => {
        if (genres.length === 0) { hasUnknown = true; return; }
        genres.forEach((g) => genreSet.add(g));
      });
      const sorted = [...genreSet].sort((a, b) => a.localeCompare(b));
      if (hasUnknown) sorted.push('Altro');
      setAllGenres(sorted);

      setLoading(false);
    }

    fetchMissing();
  }, [releases]);

  return { genresByArtistId, allGenres, loading };
}
