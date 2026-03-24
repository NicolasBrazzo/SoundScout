// Hook che recupera le ultime uscite degli artisti più popolari in Italia
// (chart Spotify + artisti correlati). Gestisce stati loading/error.

import { useState, useEffect } from 'react';
import { getFeaturedReleases } from '../services/spotifyApi';
import { getToken } from '../services/tokenService';

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
        const data = await getFeaturedReleases(token);

        if (!cancelled) {
          setReleases(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message ?? 'Errore nel caricamento delle release.');
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
