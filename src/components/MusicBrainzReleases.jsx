import { useState } from 'react';
import { useMusicBrainzReleases } from '../hooks/useMusicBrainzReleases';
import SkeletonGrid from './SkeletonGrid';

export const MusicBrainzReleases = () => {
  const [loadRequested, setLoadRequested] = useState(false);
  const { data: releases = [], isLoading, isError } = useMusicBrainzReleases(loadRequested);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-white mb-2">Ultime uscite in Italia</h2>
      <p className="text-white/50 text-sm mb-6">
        Nuove release della settimana pubblicate in Italia (dati MusicBrainz).
      </p>

      {!loadRequested ? (
        <button
          onClick={() => setLoadRequested(true)}
          className="px-6 py-3 rounded-full bg-[#ba551d] text-white font-medium hover:bg-[#d4631f] transition-colors"
        >
          Scopri le uscite italiane
        </button>
      ) : isLoading ? (
        <SkeletonGrid variant="album" count={6} />
      ) : isError ? (
        <p className="text-red-400">Errore nel caricamento delle release.</p>
      ) : releases.length === 0 ? (
        <p className="text-white/50">Nessuna uscita trovata nell'ultima settimana.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {releases.map((release) => {
            const artist = release['artist-credit']?.[0]?.name || 'Artista sconosciuto';
            const mbUrl = `https://musicbrainz.org/release/${release.id}`;

            return (
              <a
                key={release.id}
                href={mbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white/10 flex items-center justify-center text-white/30 text-3xl">
                  ♪
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {release.title}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    {artist}
                  </p>
                  <p className="text-[10px] text-white/30">
                    {release.date}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
};
