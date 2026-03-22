import { useAuth } from '../context/AuthContext';
import SpotifyLoginButton from './SpotifyLoginButton';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-[#0d0d0f]/90 backdrop-blur border-b border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#1DB954]">
          <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" fill="currentColor" opacity=".4" />
          <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-white font-semibold tracking-tight text-lg">SoundScout</span>
      </div>

      {/* Auth */}
      <div>
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white/80 text-sm transition-colors"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Disconnetti
          </button>
        ) : (
          <SpotifyLoginButton />
        )}
      </div>
    </header>
  );
}
