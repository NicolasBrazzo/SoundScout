import { useQuery } from '@tanstack/react-query';
import { getArtistAlbums } from '../services/artistsService';

export function useArtistAlbums(artistId) {
  return useQuery({
    queryKey: ['artistAlbums', artistId],
    queryFn: () => getArtistAlbums(artistId, 10),
    enabled: !!artistId,
    staleTime: Infinity,
  });
}
