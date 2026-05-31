import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Globe, Calendar, Star, Play, Heart, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { movieService, showService, favoriteService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StarRating } from '../components/ui/StarRating';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { formatDuration, formatDate, getAvailabilityLabel, formatCurrency } from '../utils/helpers';
import type { Show } from '../types';

const SHOW_DATES = ['Today', 'Sat, May 17', 'Sun, May 18', 'Mon, May 19', 'Tue, May 20'];

export default function MovieDetailPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const { setShow } = useBookingStore();
  const { isAuthenticated, userId } = useAuthStore();
  const { addToast, openTrailer, openShare } = useUIStore();

  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedLang, setSelectedLang] = useState('All');
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: movie, loading: movieLoading } = useFetch(
    () => movieService.getById(movieId!),
    [movieId]
  );
  const { data: shows, loading: showsLoading } = useFetch(
    () => showService.getByMovie(movieId!),
    [movieId]
  );

  // Check favorite
  useFetch(async () => {
    if (isAuthenticated && userId && movieId) {
      const favs = await favoriteService.getByUser(userId);
      return favs.includes(movieId);
    }
    return false;
  }, [userId, movieId, isAuthenticated]);

  const handleBookShow = (show: Show) => {
    if (!isAuthenticated) {
      addToast('Please sign in to book tickets', 'warning');
      navigate('/login');
      return;
    }
    setShow({
      id: show.id,
      movieId: movieId!,
      movieTitle: movie?.title ?? '',
      moviePoster: movie?.poster ?? '',
      theatreName: show.theatreName,
      theatreLocation: show.theatreLocation,
      screenName: show.format,
      date: show.date,
      time: show.time,
      language: show.language,
      format: show.format,
      vipPrice: show.pricing.vip,
      premiumPrice: show.pricing.premium,
      regularPrice: show.pricing.regular,
    });
    navigate(`/seats/${show.id}`);
  };

  const handleBookTickets = () => {
    if (!isAuthenticated) {
      addToast('Please sign in to book tickets', 'warning');
      navigate('/login');
      return;
    }
    // Scroll to shows section
    document.getElementById('shows-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in to add favorites', 'warning');
      navigate('/login');
      return;
    }
    try {
      const fav = await favoriteService.toggle(userId!, movieId!);
      setIsFavorite(fav);
      addToast(fav ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch {
      addToast('Failed to update favorites', 'error');
    }
  };

  const handleShare = () => {
    openShare(movie?.title ?? 'Movie', window.location.href);
  };

  const handleTrailer = () => {
    if (movie?.trailer) {
      openTrailer(movie.trailer);
    } else {
      addToast('Trailer not available', 'info');
    }
  };

  if (movieLoading) {
    return (
      <div>
        <Skeleton className="w-full h-[400px] rounded-none" />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!movie) return <div className="text-center py-20 text-gray-500">Movie not found.</div>;

  const filteredShows = shows?.filter(s => selectedLang === 'All' || s.language === selectedLang) ?? [];
  const languages = ['All', ...Array.from(new Set(shows?.map(s => s.language) ?? []))];

  const showsByTheatre = filteredShows.reduce<Record<string, Show[]>>((acc, show) => {
    if (!acc[show.theatreName]) acc[show.theatreName] = [];
    acc[show.theatreName].push(show);
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-[400px] md:h-[480px] overflow-hidden">
        <img src={movie.banner} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 pb-8">
          <div className="flex gap-6 items-end">
            <img src={movie.poster} alt={movie.title} className="hidden md:block w-32 rounded-xl shadow-2xl border-2 border-white/10 shrink-0" />
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {movie.genres.map(g => <Badge key={g} variant="info">{g}</Badge>)}
                <Badge variant={movie.certification === 'A' ? 'error' : 'warning'}>{movie.certification}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <StarRating rating={movie.rating} votes={movie.votes} />
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{formatDuration(movie.duration)}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(movie.releaseDate)}</span>
                <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" />{movie.languages.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold mb-3">About the Film</h2>
              <p className={`text-gray-600 dark:text-gray-400 leading-relaxed text-sm ${showFullDesc ? '' : 'line-clamp-3'}`}>
                {movie.description}
              </p>
              <button onClick={() => setShowFullDesc(v => !v)} className="flex items-center gap-1 text-red-600 text-sm font-medium mt-2">
                {showFullDesc ? (<><ChevronUp className="w-4 h-4" /> Show Less</>) : (<><ChevronDown className="w-4 h-4" /> Read More</>)}
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div><p className="text-xs text-gray-400 mb-0.5">Director</p><p className="text-sm font-semibold">{movie.director}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Duration</p><p className="text-sm font-semibold">{formatDuration(movie.duration)}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Languages</p><p className="text-sm font-semibold">{movie.languages.join(', ')}</p></div>
              </div>
            </section>

            {/* Shows Section */}
            <section id="shows-section">
              <h2 className="text-lg font-bold mb-4">Select Date</h2>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
                {SHOW_DATES.map(date => (
                  <button key={date} onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedDate === date
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-300'
                    }`}>
                    {date}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-6">
                {languages.map(lang => (
                  <button key={lang} onClick={() => setSelectedLang(lang)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedLang === lang
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}>
                    {lang}
                  </button>
                ))}
              </div>

              {showsLoading ? (
                <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
              ) : Object.keys(showsByTheatre).length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                  No shows available for the selected filters.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(showsByTheatre).map(([theatreName, theatreShows]) => (
                    <div key={theatreName} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{theatreName}</h3>
                          <p className="text-sm text-gray-400">{theatreShows[0].theatreLocation}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Starting from</p>
                          <p className="text-sm font-bold text-red-600">{formatCurrency(theatreShows[0].pricing.regular)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {theatreShows.map(show => {
                          const avail = getAvailabilityLabel(show.availableSeats || 50, show.totalSeats || 100);
                          return (
                            <button
                              key={show.id}
                              onClick={() => handleBookShow(show)}
                              className="flex flex-col items-center gap-1 px-4 py-2.5 border-2 rounded-xl transition-all hover:border-red-500 hover:shadow-sm border-gray-200 dark:border-gray-700"
                            >
                              <span className="font-bold text-sm text-gray-900 dark:text-white">{show.time}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-medium">{show.language}</span>
                                <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">{show.format}</span>
                              </div>
                              <span className={`text-xs font-medium ${avail.color}`}>{avail.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-3">
              <Button className="w-full" size="lg" onClick={handleBookTickets}>
                Book Tickets
              </Button>
              <div className="flex gap-2">
                <button
                  onClick={handleFavorite}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    isFavorite ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-950/20' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} /> Favourite
                </button>
                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-all">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Ratings
              </h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-black text-green-500">{movie.rating}</div>
                <div className="text-sm text-gray-400">out of 10</div>
                <StarRating rating={movie.rating} votes={movie.votes} size="sm" />
              </div>
            </div>

            {movie.trailer && (
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <button onClick={handleTrailer} className="w-full flex items-center justify-center gap-3 py-3 bg-gray-950 dark:bg-gray-800 rounded-xl text-white font-medium hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                  <Play className="w-5 h-5 fill-white" /> Watch Trailer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
