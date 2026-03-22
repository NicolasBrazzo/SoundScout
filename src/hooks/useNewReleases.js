// Hook che recupera tutte le nuove uscite Spotify dal venerdì più recente.
// Gestisce il ciclo completo: fetch paginato → filtro per data → stati loading/error/empty.

import { useState, useEffect } from 'react';
import { getAllNewReleases } from '../services/spotifyApi';
import { isAfterLastFriday } from '../utils/dateUtils';

/**
 * @param {string|null} token - Access token Spotify. Il fetch parte solo quando non è null.
 * @returns {{ releases: Array, loading: boolean, error: string|null }}
 */
export function useNewReleases(token) {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function fetchReleases() {
      setLoading(true);
      setError(null);

      try {
        const all = await getAllNewReleases(token);
        const filtered = all.filter(isAfterLastFriday);

        if (!cancelled) {
          setReleases(filtered);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message ?? 'Errore nel caricamento delle nuove uscite.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReleases();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { releases, loading, error };
}
