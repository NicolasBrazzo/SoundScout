import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getArtistAlbums } from '../services/artistsService';
import { getLastFriday } from '../utils/getLastFriday';

export function useLatestReleases(artists = []) {
  const albumQueries = useQueries({
    queries: artists.map((artist) => ({
      queryKey: ['artistAlbums', artist.id],
      queryFn: () => getArtistAlbums(artist.id),
      staleTime: Infinity, // Carica una volta per sessione
    })),
  });

  const isLoading = albumQueries.some((q) => q.isLoading);

  const releases = useMemo(() => {
    if (isLoading) return [];

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
  }, [albumQueries, artists, isLoading]);

  return { releases, isLoading };
}
