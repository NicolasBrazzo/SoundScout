import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getArtistAlbums } from '../services/artistsService';
import { getLastFriday } from '../utils/getLastFriday';

export function useLatestReleases(artists = [], enabled = false) {
  const albumQueries = useQueries({
    queries: artists.map((artist) => ({
      queryKey: ['latestRelease', artist.id],
      queryFn: () => getArtistAlbums(artist.id, 1),
      staleTime: Infinity,
      retry: false, // I retry vengono gestiti internamente da fetchSpotify
      enabled,
    })),
  });

  const isLoading = enabled && albumQueries.some((q) => q.isLoading);

  const releases = useMemo(() => {
    if (!enabled || isLoading) return [];

    const lastFriday = getLastFriday();
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
    return recent;
  }, [albumQueries, artists, isLoading, enabled]);

  return { releases, isLoading };
}
