export default function Popup({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#1a1a1f] rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white text-xl cursor-pointer"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
