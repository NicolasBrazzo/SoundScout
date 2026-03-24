import { logout } from '../services/authService';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-[#0d0d0f]/90 backdrop-blur border-b border-white/5">
      <div className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#1DB954]">
          <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" fill="currentColor" opacity=".4" />
          <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-white font-semibold tracking-tight text-lg">SoundScout</span>
      </div>
      <button
        onClick={logout}
        className="text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer"
      >
        Esci
      </button>
    </header>
  );
}
