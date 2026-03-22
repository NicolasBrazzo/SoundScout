// Multi-select per filtrare le release per genere musicale.
// selectedGenres è un Set<string>; onchange riceve il nuovo Set aggiornato.

export default function GenreFilter({ allGenres, selectedGenres, onChange }) {
  if (allGenres.length === 0) return null;

  function toggle(genre) {
    const next = new Set(selectedGenres);
    next.has(genre) ? next.delete(genre) : next.add(genre);
    onChange(next);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {allGenres.map((genre) => {
        const active = selectedGenres.has(genre);
        return (
          <button
            key={genre}
            onClick={() => toggle(genre)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
              active
                ? 'bg-[#1DB954] text-black'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
            }`}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}
