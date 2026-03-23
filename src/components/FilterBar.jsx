// Barra filtri che compone SearchInput, type toggle e GenreFilter.
// Tutti i filtri operano client-side sulla lista release già caricata.

import GenreFilter from './GenreFilter';
import SearchInput from './SearchInput';

const TYPES = [
  { value: 'album',  label: 'Album' },
  { value: 'single', label: 'Singoli' },
  { value: 'ep',     label: 'EP' },
];

export default function FilterBar({
  allGenres,
  selectedGenres,
  onGenresChange,
  searchQuery,
  onSearchChange,
  selectedTypes,
  onTypesChange,
  italianOnly,
  onItalianOnlyChange,
  totalCount,
  filteredCount,
}) {
  function toggleType(type) {
    const next = new Set(selectedTypes);
    next.has(type) ? next.delete(type) : next.add(type);
    onTypesChange(next);
  }

  const hasActiveFilters =
    selectedGenres.size > 0 || searchQuery.trim() || selectedTypes.size > 0 || italianOnly;

  function clearAll() {
    onGenresChange(new Set());
    onSearchChange('');
    onTypesChange(new Set());
    onItalianOnlyChange(false);
  }

  return (
    <div className="flex flex-col gap-4 mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/5">
      {/* Riga 1: ricerca + tipo + contatore */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48">
          <SearchInput value={searchQuery} onChange={onSearchChange} />
        </div>

        {/* Type toggle */}
        <div className="flex gap-1.5">
          {TYPES.map(({ value, label }) => {
            const active = selectedTypes.has(value);
            return (
              <button
                key={value}
                onClick={() => toggleType(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#1DB954] text-black'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Filtro italiani */}
        <button
          onClick={() => onItalianOnlyChange(!italianOnly)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            italianOnly
              ? 'bg-[#009246] text-white'
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
          }`}
        >
          Solo italiani
        </button>

        {/* Contatore + clear */}
        <div className="flex items-center gap-2 ml-auto text-xs text-white/30">
          {typeof filteredCount === 'number' && (
            <span>{filteredCount} / {totalCount} release</span>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
            >
              Cancella filtri
            </button>
          )}
        </div>
      </div>

      {/* Riga 2: generi (solo se disponibili) */}
      {allGenres.length > 0 && (
        <GenreFilter
          allGenres={allGenres}
          selectedGenres={selectedGenres}
          onChange={onGenresChange}
        />
      )}
    </div>
  );
}
