import { useQuery } from '@tanstack/react-query';
import { getLatestItalianReleases } from '../services/musicBrainzService';

export function useMusicBrainzReleases(enabled = false) {
  return useQuery({
    queryKey: ['musicBrainzReleases'],
    queryFn: () => getLatestItalianReleases(),
    enabled,
    staleTime: Infinity,
  });
}
