import { useQuery } from '@tanstack/react-query';
import { getFollowedArtists } from '../services/artistsService';

export function useFollowedArtists() {
  return useQuery({
    queryKey: ['followedArtists'],
    queryFn: () => getFollowedArtists(),
  });
}
