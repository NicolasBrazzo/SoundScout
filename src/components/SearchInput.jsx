// Input di ricerca real-time per filtrare per nome artista o titolo release.

export default function SearchInput({ value, onChange }) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
        width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cerca artista o release…"
        className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#1DB954]/40 focus:bg-white/8 transition-colors"
      />
    </div>
  );
}
