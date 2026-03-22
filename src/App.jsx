import { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import ReleaseGrid from './components/ReleaseGrid';
import FilterBar from './components/FilterBar';
import { useNewReleases } from './hooks/useNewReleases';
import { useArtistGenres } from './hooks/useArtistGenres';
import { exchangeCodeForToken } from './services/authService';

// ─── Callback ────────────────────────────────────────────────────────────────
// Spotify redirige qui con ?code=... dopo il login.
// Scambia il codice con il token e torna alla home.

function CallbackPage() {
  const { handleTokenReceived } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    const err    = params.get('error');

    if (err || !code) {
      setError(err ?? 'Parametro code mancante.');
      return;
    }

    exchangeCodeForToken(code)
      .then((accessToken) => {
        handleTokenReceived(accessToken);
        navigate('/', { replace: true });
      })
      .catch((e) => setError(e.message));
  }, [handleTokenReceived, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-red-400/70 text-sm">
        <p>Errore durante il login: {error}</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="text-white/40 underline underline-offset-2 hover:text-white/70"
        >
          Torna alla home
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen text-white/40 text-sm">
      Autenticazione in corso…
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function MainPage() {
  const { token, isLoading } = useAuth();
  const { releases, loading, error } = useNewReleases(token);
  const { genresByArtistId, allGenres } = useArtistGenres(releases, token);

  const [selectedGenres, setSelectedGenres] = useState(new Set());
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedTypes, setSelectedTypes]   = useState(new Set());

  const filteredReleases = useMemo(() => {
    return releases.filter((release) => {
      if (selectedGenres.size > 0) {
        const artistGenres = release.artists.flatMap(
          (a) => genresByArtistId.get(a.id) ?? []
        );
        const hasMatch =
          artistGenres.some((g) => selectedGenres.has(g)) ||
          (selectedGenres.has('Altro') && artistGenres.length === 0);
        if (!hasMatch) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesArtist = release.artists.some((a) => a.name.toLowerCase().includes(q));
        const matchesName   = release.name.toLowerCase().includes(q);
        if (!matchesArtist && !matchesName) return false;
      }

      if (selectedTypes.size > 0 && !selectedTypes.has(release.album_type)) return false;

      return true;
    });
  }, [releases, selectedGenres, searchQuery, selectedTypes, genresByArtistId]);

  // Mentre controlliamo il token in sessionStorage non mostriamo niente
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!token ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-white text-xl font-semibold">Nuove uscite ogni venerdì</h2>
              <p className="text-white/40 text-sm max-w-xs">
                Accedi con Spotify per vedere tutti gli album e singoli usciti questa settimana.
              </p>
            </div>
          </div>
        ) : (
          <>
            <FilterBar
              allGenres={allGenres}
              selectedGenres={selectedGenres}
              onGenresChange={setSelectedGenres}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTypes={selectedTypes}
              onTypesChange={setSelectedTypes}
              totalCount={releases.length}
              filteredCount={filteredReleases.length}
            />
            <ReleaseGrid releases={filteredReleases} loading={loading} error={error} />
          </>
        )}
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"          element={<MainPage />} />
          <Route path="/callback"  element={<CallbackPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
