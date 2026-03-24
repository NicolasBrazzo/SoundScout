import { FollowedArtists } from '../components/FollowedArtists';
import Header from '../components/Header';

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/50 mt-2">Benvenuto su SoundScout!</p>
      </main>

      <FollowedArtists />
    </div>
  );
}
