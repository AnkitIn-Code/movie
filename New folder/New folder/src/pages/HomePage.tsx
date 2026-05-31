import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Film, Zap, Clock, TrendingUp } from 'lucide-react';
import { movieService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { HeroCarousel } from '../components/movie/HeroCarousel';
import { MovieCard } from '../components/movie/MovieCard';
import { MovieCardSkeleton } from '../components/ui/Skeleton';
import { useAuthStore } from '../store/authStore';
import { favoriteService } from '../services/api';
import type { Movie } from '../types';

const CATEGORIES = ['All', 'Action', 'Drama', 'Sci-Fi', 'Comedy', 'Thriller', 'Horror', 'Romance'];

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-red-600">{icon}</span>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
}

function ScrollableMovieRow({ movies, loading, favorites, onFavoriteChange }: { movies: Movie[]; loading: boolean; favorites: Set<string>; onFavoriteChange: (id: string, fav: boolean) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="relative group">
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
        {movies.map(movie => (
          <div key={movie.id} className="flex-shrink-0 w-40 sm:w-44 snap-start">
            <MovieCard movie={movie} isFavorite={favorites.has(movie.id)} onFavoriteChange={onFavoriteChange} />
          </div>
        ))}
      </div>
      <button onClick={() => scroll('left')} className="absolute left-0 top-1/3 -translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white dark:bg-gray-900 shadow-lg">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button onClick={() => scroll('right')} className="absolute right-0 top-1/3 translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white dark:bg-gray-900 shadow-lg">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const { isAuthenticated, userId } = useAuthStore();

  const { data: allMovies, loading: allLoading } = useFetch(() => movieService.getAll());
  const { data: trendingMovies, loading: trendingLoading } = useFetch(() => movieService.getTrending());
  const { data: upcomingMovies, loading: upcomingLoading } = useFetch(() => movieService.getUpcoming());

  // Load favorites
  const { data: favData } = useFetch(() => isAuthenticated && userId ? favoriteService.getByUser(userId) : Promise.resolve([] as string[]), [userId, isAuthenticated]);
  if (favData && favoriteIds.size === 0 && favData.length > 0) {
    setFavoriteIds(new Set(favData));
  }

  const filteredMovies = activeCategory === 'All'
    ? (allMovies ?? [])
    : (allMovies ?? []).filter(m => m.genres.some(g => g.toLowerCase() === activeCategory.toLowerCase()));

  const handleFavoriteChange = (movieId: string, fav: boolean) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (fav) next.add(movieId); else next.delete(movieId);
      return next;
    });
  };

  const heroMovies = trendingMovies ?? allMovies?.slice(0, 4) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-14">
      {heroMovies.length > 0 && <HeroCarousel movies={heroMovies} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Movies Available', value: '500+', icon: Film },
          { label: 'Active Theatres', value: '1,200+', icon: Zap },
          { label: 'Shows Daily', value: '8,000+', icon: Clock },
          { label: 'Happy Customers', value: '50M+', icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
              <Icon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <section>
        <SectionHeader title="Trending Now" icon={<TrendingUp className="w-5 h-5" />} />
        <ScrollableMovieRow movies={trendingMovies ?? []} loading={trendingLoading} favorites={favoriteIds} onFavoriteChange={handleFavoriteChange} />
      </section>

      <section>
        <SectionHeader title="Now Showing" icon={<Film className="w-5 h-5" />} />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {allLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} isFavorite={favoriteIds.has(movie.id)} onFavoriteChange={handleFavoriteChange} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Coming Soon" icon={<Clock className="w-5 h-5" />} />
        <ScrollableMovieRow movies={upcomingMovies ?? []} loading={upcomingLoading} favorites={favoriteIds} onFavoriteChange={handleFavoriteChange} />
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-700 to-red-900 p-8 md:p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 text-9xl font-black text-white">50%</div>
        </div>
        <div className="relative">
          <span className="text-sm font-semibold text-red-200 uppercase tracking-widest">Limited Time</span>
          <h3 className="text-2xl md:text-3xl font-black text-white mt-1 mb-2">First Booking Offer</h3>
          <p className="text-red-100 mb-5">Use code <span className="font-bold bg-white/10 px-2 py-0.5 rounded">FIRST50</span> and get Rs.50 off on your first booking</p>
          <button onClick={() => window.location.href = '/movies'} className="bg-white text-red-700 font-bold px-6 py-2.5 rounded-xl hover:bg-red-50 transition-colors">
            Explore Movies
          </button>
        </div>
      </section>
    </div>
  );
}
