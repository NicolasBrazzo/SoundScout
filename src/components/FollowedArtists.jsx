import { useState } from "react";
import { useArtistAlbums } from "../hooks/useArtistAlbums";
import Popup from "./Popup";
import SkeletonGrid from "./SkeletonGrid";

export const FollowedArtists = ({ artists: followedArtists = [], loading = false }) => {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const { data: artistAlbums = [], isLoading: albumsLoading } = useArtistAlbums(selectedArtist?.id);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-white mb-6">Artisti che segui</h2>
        <SkeletonGrid />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-white mb-6">Artisti che segui</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {followedArtists.length > 0 ?
          followedArtists.map((artist) => (
            <div
              // onClick={() => setSelectedArtist(artist)}
              key={artist.id}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="w-full aspect-square overflow-hidden rounded-full shadow-lg">
                {artist.images[0]?.url ?
                  <img
                    src={artist.images[0].url}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                : <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/30 text-3xl">
                    ♪
                  </div>
                }
              </div>
              <span className="text-sm font-medium text-white text-center truncate w-full">
                {artist.name}
              </span>
            </div>
          ))
        : <div className="flex items-center justify-center w-full">
            <p className="text-white/50">
              Nessun artista seguito trovato.
            </p>
          </div>
        }
      </div>

      <Popup open={!!selectedArtist} onClose={() => setSelectedArtist(null)}>
        {selectedArtist && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg">
              {selectedArtist.images[0]?.url ?
                <img
                  src={selectedArtist.images[0].url}
                  alt={selectedArtist.name}
                  className="w-full h-full object-cover"
                />
              : <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/30 text-3xl">
                  ♪
                </div>
              }
            </div>

            <h3 className="text-xl font-bold text-white">
              {selectedArtist.name}
            </h3>

            {selectedArtist.genres?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                {selectedArtist.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/70"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {selectedArtist.external_urls?.spotify && (
              <a
                href={selectedArtist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 px-5 py-2 rounded-full bg-[#1db954] text-white text-sm font-medium hover:bg-[#1ed760] transition-colors"
              >
                Apri su Spotify
              </a>
            )}

            {/* Album */}
            <div className="w-full mt-4 border-t border-white/10 pt-4">
              <h4 className="text-sm font-semibold text-white/70 mb-3">
                Album
              </h4>
              {albumsLoading ?
                <SkeletonGrid variant="album" count={6} />
              : <div className="grid grid-cols-3 gap-3">
                  {artistAlbums.map((album) => (
                    <a
                      key={album.id}
                      href={album.external_urls?.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/album"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden">
                        {album.images[0]?.url ?
                          <img
                            src={album.images[0].url}
                            alt={album.name}
                            className="w-full h-full object-cover group-hover/album:scale-105 transition-transform duration-300"
                          />
                        : <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/30">
                            ♪
                          </div>
                        }
                      </div>
                      <p className="text-xs text-white/60 mt-1.5 truncate group-hover/album:text-white transition-colors">
                        {album.name}
                      </p>
                      <p className="text-[10px] text-white/30">
                        {album.release_date?.slice(0, 4)}
                      </p>
                    </a>
                  ))}
                </div>
              }
            </div>
          </div>
        )}
      </Popup>
    </section>
  );
};
