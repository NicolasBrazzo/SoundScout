import { useFollowedArtists } from '../hooks/useFollowedArtists';
import { FollowedArtists } from '../components/FollowedArtists';
import { LatestReleases } from '../components/LatestReleases';
import { MusicBrainzReleases } from '../components/MusicBrainzReleases';
import Header from '../components/Header';

export default function Dashboard() {
  const { data: followedArtists = [], isLoading } = useFollowedArtists();

  return (
    <div className="min-h-screen">
      <Header />
      <section className="max-w-7xl mx-auto px-4 pt-10 pb-4">
        <h1 className="text-3xl font-bold text-white">Le tue novità della settimana</h1>
        <p className="text-white/50 mt-2 max-w-xl">
          Qui trovi gli album e i singoli usciti da venerdì scorso ad oggi, dagli artisti che segui su Spotify.
        </p>
      </section>

      {/* <MusicBrainzReleases /> */}
      <LatestReleases artists={followedArtists} loading={isLoading} />
      <FollowedArtists artists={followedArtists} loading={isLoading} />
    </div>
  );
}
