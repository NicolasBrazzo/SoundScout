import { useAuth } from '../context/AuthContext';

export default function SpotifyLoginButton() {
  const { login } = useAuth();

  return (
    <button
      onClick={login}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DB954] hover:bg-[#1ed760] text-black text-sm font-semibold transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.297a.75.75 0 0 1-1.032.25c-2.823-1.726-6.376-2.116-10.561-1.159a.75.75 0 1 1-.334-1.463c4.577-1.044 8.504-.595 11.677 1.34a.75.75 0 0 1 .25 1.032zm1.472-3.27a.937.937 0 0 1-1.29.308C14.924 12.42 11.1 11.95 7.2 13.01a.937.937 0 1 1-.483-1.81c4.372-1.167 8.698-.602 12.063 1.538a.937.937 0 0 1 .308 1.289zm.126-3.403C15.684 8.394 9.963 8.2 6.696 9.15a1.125 1.125 0 1 1-.653-2.152C9.933 5.931 16.28 6.16 20.07 8.55a1.125 1.125 0 0 1-1.016 2.014 1.123 1.123 0 0 1 .06-.94z" />
      </svg>
      Accedi con Spotify
    </button>
  );
}
