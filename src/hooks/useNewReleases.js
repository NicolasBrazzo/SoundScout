// Hook che recupera tutte le nuove uscite Spotify dal venerdì più recente.
// Gestisce il ciclo completo: fetch paginato → filtro per data → stati loading/error/empty.

import { useState, useEffect } from 'react';
import { getAllNewReleases } from '../services/spotifyApi';
import { getToken } from '../services/tokenService';
import { isAfterLastFriday } from '../utils/dateUtils';

/**
 * @returns {{ releases: Array, loading: boolean, error: string|null }}
 */
export function useNewReleases() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchReleases() {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
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
  }, []);

  return { releases, loading, error };
}
