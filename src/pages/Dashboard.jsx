import { useEffect, useState } from 'react';
import { getFollowedArtists } from '../services/artistsService';
import { FollowedArtists } from '../components/FollowedArtists';
import { LatestReleases } from '../components/LatestReleases';
import Header from '../components/Header';

export default function Dashboard() {
  const [followedArtists, setFollowedArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchArtists() {
      try {
        const artists = await getFollowedArtists();
        if (!ignore) setFollowedArtists(artists);
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchArtists();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="max-w-7xl mx-auto px-4 pt-10 pb-4">
        <h1 className="text-3xl font-bold text-white">Le tue novità della settimana</h1>
        <p className="text-white/50 mt-2 max-w-xl">
          Qui trovi gli album e i singoli usciti da venerdì scorso ad oggi, dagli artisti che segui su Spotify.
        </p>
      </section>

      <LatestReleases artists={followedArtists} loading={loading} />
      <FollowedArtists artists={followedArtists} loading={loading} />
    </div>
  );
}
