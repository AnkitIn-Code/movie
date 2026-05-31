import { X } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export function TrailerModal() {
  const { trailerOpen, trailerUrl, closeTrailer } = useUIStore();

  if (!trailerOpen || !trailerUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeTrailer}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <button onClick={closeTrailer} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors">
          <X className="w-8 h-8" />
        </button>
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={`${trailerUrl}?autoplay=1`}
            title="Trailer"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
