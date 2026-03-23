import { useMemo, useState } from 'react';
import Header from './components/Header';
import ReleaseGrid from './components/ReleaseGrid';
import FilterBar from './components/FilterBar';
import { useNewReleases } from './hooks/useNewReleases';
import { useArtistGenres } from './hooks/useArtistGenres';

export default function App() {
  const { releases, loading, error } = useNewReleases();
  const { genresByArtistId, allGenres } = useArtistGenres(releases);

  const [selectedGenres, setSelectedGenres] = useState(new Set());
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedTypes, setSelectedTypes]   = useState(new Set());
  const [italianOnly, setItalianOnly]       = useState(false);

  const filteredReleases = useMemo(() => {
    return releases.filter((release) => {
      if (italianOnly) {
        const artistGenres = release.artists.flatMap(
          (a) => genresByArtistId.get(a.id) ?? []
        );
        const isItalian = artistGenres.some(
          (g) => g.includes('italian') || g.includes('italiano') || g.includes('italiana')
        );
        if (!isItalian) return false;
      }

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
  }, [releases, selectedGenres, searchQuery, selectedTypes, italianOnly, genresByArtistId]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <FilterBar
          allGenres={allGenres}
          selectedGenres={selectedGenres}
          onGenresChange={setSelectedGenres}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTypes={selectedTypes}
          onTypesChange={setSelectedTypes}
          italianOnly={italianOnly}
          onItalianOnlyChange={setItalianOnly}
          totalCount={releases.length}
          filteredCount={filteredReleases.length}
        />
        <ReleaseGrid releases={filteredReleases} loading={loading} error={error} />
      </main>
    </div>
  );
}
