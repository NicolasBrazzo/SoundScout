// Placeholder animato mostrato durante il caricamento delle release.
// Riproduce la struttura visiva di ReleaseCard con un effetto pulse.

export default function SkeletonCard() {
  return (
    <div className="flex flex-col bg-[#18181b] rounded-xl overflow-hidden border border-white/5 animate-pulse">
      {/* Cover placeholder */}
      <div className="aspect-square w-full bg-white/5" />

      {/* Info placeholder */}
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3.5 bg-white/10 rounded w-4/5" />
        <div className="h-3 bg-white/5 rounded w-3/5" />
        <div className="flex items-center justify-between mt-1">
          <div className="h-4 bg-white/10 rounded-full w-14" />
          <div className="h-3 bg-white/5 rounded w-10" />
        </div>
        <div className="mt-2 h-7 bg-white/5 rounded-lg w-full" />
      </div>
    </div>
  );
}
