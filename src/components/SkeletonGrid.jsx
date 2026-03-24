const variants = {
  artist: {
    grid: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5",
    item: (
      <>
        <div className="w-full aspect-square rounded-full bg-white/10" />
        <div className="h-4 w-24 rounded bg-white/10" />
      </>
    ),
    itemClass: "animate-pulse flex flex-col items-center gap-3",
  },
  album: {
    grid: "grid grid-cols-3 gap-3",
    item: (
      <>
        <div className="aspect-square rounded-lg bg-white/10" />
        <div className="h-3 w-full rounded bg-white/10 mt-2" />
      </>
    ),
    itemClass: "animate-pulse",
  },
};

export default function SkeletonGrid({ count = 10, variant = "artist" }) {
  const v = variants[variant] || variants.artist;

  return (
    <div className={v.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={v.itemClass}>
          {v.item}
        </div>
      ))}
    </div>
  );
}
