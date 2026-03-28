import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getArtistAlbums } from '../services/artistsService';
import { getLastFriday } from '../utils/getLastFriday';

const CACHE_KEY = 'latestReleases';

function readCache(lastFriday) {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && cached.friday === lastFriday.toISOString()) {
      return cached.releases;
    }
  } catch { /* cache corrotta, ignora */ }
  return null;
}

function writeCache(releases, lastFriday) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      friday: lastFriday.toISOString(),
      releases,
    }));
  } catch { /* quota exceeded, ignora */ }
}

export function useLatestReleases(artists = [], enabled = false) {
  const lastFriday = useMemo(() => getLastFriday(), []);
  const [cachedReleases] = useState(() => readCache(lastFriday));
  const cacheHit = cachedReleases !== null;

  const albumQueries = useQueries({
    queries: artists.map((artist) => ({
      queryKey: ['latestRelease', artist.id],
      queryFn: () => getArtistAlbums(artist.id).then((data) => {
        return data;
      }),
      staleTime: Infinity,
      retry: false,
      enabled: enabled && !cacheHit,
    })),
  });

  const isLoading = enabled && !cacheHit && albumQueries.some((q) => q.isLoading);

  const releases = useMemo(() => {
    if (cacheHit) return cachedReleases;
    if (!enabled || isLoading) return [];

    const recent = [];

    albumQueries.forEach((query, i) => {
      if (query.status !== 'success') return;
      for (const album of query.data) {
        if (new Date(album.release_date) >= lastFriday) {
          recent.push({ ...album, artist: artists[i] });
        }
      }
    });

    recent.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

    if (recent.length > 0) {
      writeCache(recent, lastFriday);
    }

    return recent;
  }, [albumQueries, artists, isLoading, enabled, cacheHit, cachedReleases, lastFriday]);

  return { releases, isLoading };
}
