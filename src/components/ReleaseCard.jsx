import { parseReleaseDate } from '../utils/dateUtils';

/**
 * Su mobile tenta il deep link spotify:// e cade sul web URL dopo 1.5s.
 * Su desktop apre direttamente il web URL in un nuovo tab.
 */
function openSpotify(e, release) {
  const webUrl = release.external_urls?.spotify;
  if (!webUrl) return;

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  if (!isMobile) return; // lascia funzionare il normale href target="_blank"

  e.preventDefault();
  const deepLink = `spotify:album:${release.id}`;
  window.location.href = deepLink;
  setTimeout(() => {
    if (!document.hidden) window.open(webUrl, '_blank', 'noopener,noreferrer');
  }, 1500);
}

const BADGE_STYLES = {
  album:  'bg-blue-600/20 text-blue-400 border border-blue-600/30',
  single: 'bg-green-600/20 text-green-400 border border-green-600/30',
  ep:     'bg-purple-600/20 text-purple-400 border border-purple-600/30',
};

function formatDate(dateStr) {
  const date = parseReleaseDate(dateStr);
  if (!date) return dateStr;
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
}

function artistNames(artists) {
  return artists.map((a) => a.name).join(', ');
}

export default function ReleaseCard({ release }) {
  const { name, artists, images, album_type, release_date, external_urls } = release;

  const cover = images?.[0]?.url;
  const badgeStyle = BADGE_STYLES[album_type?.toLowerCase()] ?? BADGE_STYLES.album;
  const spotifyUrl = external_urls?.spotify;

  return (
    <div className="group flex flex-col bg-[#18181b] rounded-xl overflow-hidden border border-white/5 transition-transform duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40">
      {/* Cover art */}
      <div className="aspect-square w-full overflow-hidden bg-[#232328]">
        {cover ? (
          <img
            src={cover}
            alt={`Cover di ${name}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3">
        <p className="text-white font-medium text-sm leading-tight line-clamp-1">{name}</p>
        <p className="text-white/50 text-xs line-clamp-1">{artistNames(artists)}</p>

        <div className="flex items-center justify-between mt-1 gap-2">
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${badgeStyle}`}>
            {album_type}
          </span>
          <span className="text-white/30 text-xs">{formatDate(release_date)}</span>
        </div>

        {/* Pulsante Spotify — deep link su mobile, web URL su desktop */}
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => openSpotify(e, release)}
          className="mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-[#1DB954]/10 hover:bg-[#1DB954]/20 border border-[#1DB954]/20 text-[#1DB954] text-xs font-medium transition-colors"
          aria-label={`Apri ${name} su Spotify`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.297a.75.75 0 0 1-1.032.25c-2.823-1.726-6.376-2.116-10.561-1.159a.75.75 0 1 1-.334-1.463c4.577-1.044 8.504-.595 11.677 1.34a.75.75 0 0 1 .25 1.032zm1.472-3.27a.937.937 0 0 1-1.29.308C14.924 12.42 11.1 11.95 7.2 13.01a.937.937 0 1 1-.483-1.81c4.372-1.167 8.698-.602 12.063 1.538a.937.937 0 0 1 .308 1.289zm.126-3.403C15.684 8.394 9.963 8.2 6.696 9.15a1.125 1.125 0 1 1-.653-2.152C9.933 5.931 16.28 6.16 20.07 8.55a1.125 1.125 0 0 1-1.016 2.014 1.123 1.123 0 0 1 .06-.94z" />
          </svg>
          Apri Spotify
        </a>
      </div>
    </div>
  );
}
