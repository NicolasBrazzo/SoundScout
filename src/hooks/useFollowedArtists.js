import { useQuery } from '@tanstack/react-query';
import { getFollowedArtists } from '../services/artistsService';

export function useFollowedArtists() {
  return useQuery({
    queryKey: ['followedArtists'],
    queryFn: () => getFollowedArtists(),
    staleTime: Infinity, // Non cambia durante la sessione, carica una volta sola
  });
}
