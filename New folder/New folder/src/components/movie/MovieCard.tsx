import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import type { Movie } from '../../types';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { favoriteService } from '../../services/api';

interface MovieCardProps {
  movie: Movie;
  isFavorite?: boolean;
  onFavoriteChange?: (movieId: string, fav: boolean) => void;
}

export function MovieCard({ movie, isFavorite = false, onFavoriteChange }: MovieCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuthStore();
  const { addToast } = useUIStore();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast('Please sign in to add favorites', 'warning');
      navigate('/login');
      return;
    }
    try {
      const fav = await favoriteService.toggle(userId!, movie.id);
      onFavoriteChange?.(movie.id, fav);
      addToast(fav ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch {
      addToast('Failed to update favorites', 'error');
    }
  };

  return (
    <div className="group relative flex flex-col">
      <Link to={`/movies/${movie.id}`} className="block">
        <div className="relative overflow-hidden rounded-xl aspect-[2/3]">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/movies/${movie.id}`); }}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
            >
              Book Now
            </button>
          </div>
          <div className="absolute top-2 left-2">
            <Badge variant={movie.certification === 'A' ? 'error' : movie.certification === 'UA' ? 'warning' : 'success'}>
              {movie.certification}
            </Badge>
          </div>
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        </div>
      </Link>
      <div className="mt-2.5 flex flex-col gap-1">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-1">{movie.title}</h3>
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-green-500">{movie.rating}/10</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {movie.genres.slice(0, 2).map(g => (
            <span key={g} className="text-xs text-gray-500 dark:text-gray-400">{g}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
