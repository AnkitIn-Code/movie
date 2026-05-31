import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Ticket, Heart, CreditCard, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { bookingService, favoriteService, movieService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../utils/helpers';

const TABS = ['bookings', 'favorites', 'payments'] as const;
type Tab = typeof TABS[number];

export default function UserProfilePage() {
  const { isAuthenticated, name, email, userId, signOut } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('bookings');
  const [favoriteMovieIds, setFavoriteMovieIds] = useState<string[]>([]);

  const { data: bookings, loading: bookingsLoading } = useFetch(
    () => bookingService.getByUser(userId ?? ''),
    [userId]
  );

  const { data: favIds } = useFetch(
    () => isAuthenticated && userId ? favoriteService.getByUser(userId) : Promise.resolve([]),
    [userId, isAuthenticated]
  );

  const { data: allMovies } = useFetch(() => movieService.getAll());

  // Sync favorites
  if (favIds && favIds.length > 0 && favoriteMovieIds.length === 0) {
    setFavoriteMovieIds(favIds);
  }

  const favoriteMovies = (allMovies ?? []).filter(m => favoriteMovieIds.includes(m.id));

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await bookingService.cancelBooking(bookingId, userId!);
      addToast('Booking cancelled successfully', 'success');
    } catch {
      addToast('Failed to cancel booking', 'error');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    addToast('Signed out successfully', 'success');
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 space-y-4">
        <User className="w-12 h-12 text-gray-300 mx-auto" />
        <p className="text-gray-500">Please sign in to view your profile.</p>
        <Link to="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  const tabLabels: Record<Tab, { label: string; icon: React.ReactNode }> = {
    bookings: { label: 'My Bookings', icon: <Ticket className="w-4 h-4" /> },
    favorites: { label: 'Favorites', icon: <Heart className="w-4 h-4" /> },
    payments: { label: 'Saved Payments', icon: <CreditCard className="w-4 h-4" /> },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-3">
              {name?.[0] ?? 'U'}
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white">{name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{email}</p>
          </div>

          <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-red-50 dark:bg-red-950/30 text-red-600 border-l-2 border-red-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-l-2 border-transparent'
                }`}
              >
                {tabLabels[tab].icon}
                {tabLabels[tab].label}
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            ))}
          </nav>

          <Button variant="danger" className="w-full" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-red-600" /> My Bookings
              </h2>
              {bookingsLoading ? (
                <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
              ) : !bookings?.length ? (
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
                  <Ticket className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No bookings yet.</p>
                  <Link to="/" className="mt-3 inline-block"><Button size="sm">Browse Movies</Button></Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking.id} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex gap-4">
                      {booking.moviePoster && (
                        <img src={booking.moviePoster} alt={booking.movieTitle} className="w-16 h-22 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate">{booking.movieTitle}</h3>
                          <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'cancelled' ? 'error' : 'warning'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{booking.theatreName}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(booking.showDate)} | {booking.showTime}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(booking.totalAmount)}</span>
                        </div>
                        {booking.status === 'confirmed' && (
                          <div className="flex gap-2 mt-3">
                            <Link to={`/booking/success/${booking.id}`}>
                              <Button size="sm" variant="secondary">View Ticket</Button>
                            </Link>
                            <Button size="sm" variant="danger" onClick={() => handleCancelBooking(booking.id)}>Cancel</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" /> Favorite Movies
              </h2>
              {favoriteMovies.length === 0 ? (
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
                  <Heart className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No favorites yet. Heart a movie to add it here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {favoriteMovies.map(movie => (
                    <Link key={movie.id} to={`/movies/${movie.id}`} className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-red-300 transition-all">
                      <div className="relative">
                        <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{movie.title}</h3>
                        <p className="text-xs text-gray-400">{movie.genres[0]}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" /> Saved Payments
              </h2>
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No saved payment methods yet.</p>
                <p className="text-xs text-gray-400 mt-1">Payment methods will appear here after your first booking.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
