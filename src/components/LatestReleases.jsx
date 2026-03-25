import { useState } from "react";
import { useLatestReleases } from "../hooks/useLatestReleases";
import SkeletonGrid from "./SkeletonGrid";

export const LatestReleases = ({ artists = [], loading: artistsLoading = false }) => {
  const [loadRequested, setLoadRequested] = useState(false);
  const { releases, isLoading } = useLatestReleases(
    artistsLoading ? [] : artists,
    loadRequested,
  );

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-white mb-6">Ultime uscite</h2>

      {!loadRequested ? (
        <button
          onClick={() => setLoadRequested(true)}
          disabled={artistsLoading}
          className="px-6 py-3 rounded-full bg-[#1db954] text-white font-medium hover:bg-[#1ed760] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Carica novità
        </button>
      ) : isLoading ? (
        <SkeletonGrid variant="album" count={6} />
      ) : releases.length === 0 ? (
        <p className="text-white/50">Nessuna nuova uscita da venerdì scorso.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {releases.map((album) => (
            <a
              key={album.id}
              href={album.external_urls?.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                {album.images[0]?.url ? (
                  <img
                    src={album.images[0].url}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/30 text-3xl">
                    ♪
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {album.name}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {album.artist.name}
                </p>
                <p className="text-[10px] text-white/30">
                  {album.release_date}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};
