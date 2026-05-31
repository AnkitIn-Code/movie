import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import type { Movie } from '../../types';
import { formatDuration } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { useUIStore } from '../../store/uiStore';

interface HeroCarouselProps {
  movies: Movie[];
}

export function HeroCarousel({ movies }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { openTrailer } = useUIStore();

  const next = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(c => (c + 1) % movies.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, movies.length]);

  const prev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(c => (c - 1 + movies.length) % movies.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const movie = movies[current];
  if (!movie) return null;

  return (
    <div className="relative w-full h-[480px] md:h-[580px] overflow-hidden rounded-2xl">
      <div
        key={movie.id}
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: isAnimating ? 0.6 : 1 }}
      >
        <img src={movie.banner} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="relative h-full flex items-end pb-12 px-8 md:px-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            {movie.genres.slice(0, 3).map(g => (
              <span key={g} className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/20">{g}</span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">{movie.title}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-white font-bold">{movie.rating}/10</span>
            </div>
            <span className="text-gray-300 text-sm">{formatDuration(movie.duration)}</span>
            <span className="text-gray-300 text-sm">{movie.certification}</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-2">{movie.description}</p>
          <div className="flex gap-3">
            <button onClick={() => navigate(`/movies/${movie.id}`)}>
              <Button size="lg" className="px-8">Book Now</Button>
            </button>
            {movie.trailer && (
              <Button variant="outline" size="lg" onClick={() => openTrailer(movie.trailer!)} className="border-white/30 text-white hover:bg-white/10">
                <Play className="w-4 h-4" /> Trailer
              </Button>
            )}
          </div>
        </div>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all backdrop-blur-sm">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all backdrop-blur-sm">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? 'w-6 h-2 bg-red-500' : 'w-2 h-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
