import ReleaseCard from './ReleaseCard';
import SkeletonCard from './SkeletonCard';

const SKELETON_COUNT = 20;

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/40">
      <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
      </svg>
      <p className="text-sm">Nessuna nuova uscita trovata per questa settimana.</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-400/70">
      <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// releases: array di oggetti album dalla Spotify API
// loading: booleano — mostra skeleton cards
// error: stringa | null — mostra messaggio di errore
export default function ReleaseGrid({ releases, loading, error }) {
  if (error) return <ErrorState message={error} />;

  if (!loading && releases.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {loading
        ? Array.from({ length: SKELETON_COUNT }, (_, i) => <SkeletonCard key={i} />)
        : releases.map((release) => <ReleaseCard key={release.id} release={release} />)
      }
    </div>
  );
}
