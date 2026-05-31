import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Plus, Calendar, DollarSign, Ticket, BarChart3, Settings, Building2, CreditCard as Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { movieService, showService, theatreService, analyticsService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/helpers';
import type { Movie } from '../types';

const TABS = ['overview', 'movies', 'shows', 'theatres'] as const;
type Tab = typeof TABS[number];

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">{icon}</div>
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function ProviderDashboard() {
  const { isAuthenticated, userId, role } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Add movie form
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: '', description: '', poster: '', banner: '', trailer: '',
    duration: '120', director: '', certification: 'U', status: 'now_showing',
    languages: 'English', genres: 'Drama',
  });
  const [addingMovie, setAddingMovie] = useState(false);

  // Add show form
  const [showAddShow, setShowAddShow] = useState(false);
  const [showForm, setShowForm] = useState({
    movieId: '', screenId: '', date: '', time: '10:00', language: 'English', format: '2D',
    vipPrice: '500', premiumPrice: '350', regularPrice: '200',
  });
  const [addingShow, setAddingShow] = useState(false);

  const { data: movies, loading: moviesLoading } = useFetch(() => movieService.getAll());
  const { data: theatres } = useFetch(() => theatreService.getAll());
  const { data: stats } = useFetch(() => analyticsService.getProviderStats(userId ?? ''), [userId]);

  const screens = useFetch(async () => {
    if (!theatres?.length) return [];
    const allScreens = [];
    for (const t of theatres) {
      const s = await theatreService.getScreens(t.id);
      allScreens.push(...s);
    }
    return allScreens;
  }, [theatres]);

  if (!isAuthenticated || role !== 'provider') {
    return (
      <div className="text-center py-20 space-y-4">
        <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
        <p className="text-gray-500">Provider access required.</p>
        <Button onClick={() => navigate('/provider/login')}>Sign In as Provider</Button>
      </div>
    );
  }

  const handleAddMovie = async () => {
    if (!movieForm.title.trim()) { addToast('Title is required', 'warning'); return; }
    setAddingMovie(true);
    try {
      await movieService.create({
        title: movieForm.title,
        description: movieForm.description,
        poster: movieForm.poster,
        banner: movieForm.banner,
        trailer: movieForm.trailer,
        duration: Number(movieForm.duration),
        director: movieForm.director,
        certification: movieForm.certification,
        status: movieForm.status as Movie['status'],
        languages: movieForm.languages.split(',').map(s => s.trim()),
        genres: movieForm.genres.split(',').map(s => s.trim()),
      }, userId!);
      addToast('Movie added successfully!', 'success');
      setShowAddMovie(false);
      setMovieForm({ title: '', description: '', poster: '', banner: '', trailer: '', duration: '120', director: '', certification: 'U', status: 'now_showing', languages: 'English', genres: 'Drama' });
    } catch {
      addToast('Failed to add movie', 'error');
    } finally {
      setAddingMovie(false);
    }
  };

  const handleAddShow = async () => {
    if (!showForm.movieId || !showForm.screenId || !showForm.date) {
      addToast('Please fill all required fields', 'warning');
      return;
    }
    setAddingShow(true);
    try {
      await showService.create({
        movieId: showForm.movieId,
        screenId: showForm.screenId,
        date: showForm.date,
        time: showForm.time,
        language: showForm.language,
        format: showForm.format,
        vipPrice: Number(showForm.vipPrice),
        premiumPrice: Number(showForm.premiumPrice),
        regularPrice: Number(showForm.regularPrice),
      }, userId!);
      addToast('Show created successfully!', 'success');
      setShowAddShow(false);
    } catch {
      addToast('Failed to create show', 'error');
    } finally {
      setAddingShow(false);
    }
  };

  const tabDef = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'movies', label: 'Movies', icon: <Film className="w-4 h-4" /> },
    { id: 'shows', label: 'Shows', icon: <Calendar className="w-4 h-4" /> },
    { id: 'theatres', label: 'Theatres', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Provider Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your cinema platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm"><Settings className="w-4 h-4" /> Settings</Button>
          <Button size="sm" onClick={() => setShowAddMovie(true)}><Plus className="w-4 h-4" /> Add Movie</Button>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabDef.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Movies" value={String(stats?.totalMovies ?? 0)} icon={<Film className="w-5 h-5 text-red-600" />} />
            <StatCard label="Total Shows" value={String(stats?.totalShows ?? 0)} icon={<Calendar className="w-5 h-5 text-red-600" />} />
            <StatCard label="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} icon={<DollarSign className="w-5 h-5 text-red-600" />} />
            <StatCard label="Total Bookings" value={String(stats?.totalBookings ?? 0)} icon={<Ticket className="w-5 h-5 text-red-600" />} />
          </div>
        </div>
      )}

      {/* Movies */}
      {activeTab === 'movies' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">All Movies ({movies?.length ?? 0})</h2>
            <Button size="sm" onClick={() => setShowAddMovie(true)}><Plus className="w-4 h-4" /> Add Movie</Button>
          </div>
          {moviesLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Movie</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Genre</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">Rating</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(movies ?? []).map(movie => (
                    <tr key={movie.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded-lg" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{movie.title}</p>
                            <p className="text-xs text-gray-400">{movie.director}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell"><span className="text-xs text-gray-500">{movie.genres[0]}</span></td>
                      <td className="px-5 py-3 hidden md:table-cell"><span className="text-sm font-bold text-green-500">{movie.rating}</span></td>
                      <td className="px-5 py-3">
                        <Badge variant={movie.status === 'now_showing' ? 'success' : movie.status === 'upcoming' ? 'info' : 'warning'}>
                          {movie.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost"><Edit className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Shows */}
      {activeTab === 'shows' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Manage Shows</h2>
            <Button size="sm" onClick={() => setShowAddShow(true)}><Plus className="w-4 h-4" /> Create Show</Button>
          </div>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Create and manage show schedules</p>
            <Button size="sm" onClick={() => setShowAddShow(true)}><Plus className="w-4 h-4" /> Create Show</Button>
          </div>
        </div>
      )}

      {/* Theatres */}
      {activeTab === 'theatres' && (
        <div>
          <h2 className="font-bold text-lg mb-4">Theatres & Screens</h2>
          <div className="space-y-4">
            {(theatres ?? []).map(theatre => (
              <div key={theatre.id} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <h3 className="font-bold text-gray-900 dark:text-white">{theatre.name}</h3>
                <p className="text-sm text-gray-400">{theatre.location}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {theatre.amenities.map(a => (
                    <Badge key={a} variant="info" size="sm">{a}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Movie Modal */}
      {showAddMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddMovie(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Add New Movie</h2>
            <div className="space-y-3">
              <Input label="Title" placeholder="Movie title" value={movieForm.title} onChange={e => setMovieForm(f => ({ ...f, title: e.target.value }))} />
              <Input label="Description" placeholder="Movie description" value={movieForm.description} onChange={e => setMovieForm(f => ({ ...f, description: e.target.value }))} />
              <Input label="Poster URL" placeholder="https://..." value={movieForm.poster} onChange={e => setMovieForm(f => ({ ...f, poster: e.target.value }))} />
              <Input label="Banner URL" placeholder="https://..." value={movieForm.banner} onChange={e => setMovieForm(f => ({ ...f, banner: e.target.value }))} />
              <Input label="Trailer URL" placeholder="https://www.youtube.com/embed/..." value={movieForm.trailer} onChange={e => setMovieForm(f => ({ ...f, trailer: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Duration (min)" placeholder="120" value={movieForm.duration} onChange={e => setMovieForm(f => ({ ...f, duration: e.target.value }))} />
                <Input label="Director" placeholder="Director name" value={movieForm.director} onChange={e => setMovieForm(f => ({ ...f, director: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Certification" placeholder="U, UA, A" value={movieForm.certification} onChange={e => setMovieForm(f => ({ ...f, certification: e.target.value }))} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select value={movieForm.status} onChange={e => setMovieForm(f => ({ ...f, status: e.target.value }))}
                    className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none">
                    <option value="now_showing">Now Showing</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
              </div>
              <Input label="Languages (comma separated)" placeholder="English, Hindi" value={movieForm.languages} onChange={e => setMovieForm(f => ({ ...f, languages: e.target.value }))} />
              <Input label="Genres (comma separated)" placeholder="Action, Drama" value={movieForm.genres} onChange={e => setMovieForm(f => ({ ...f, genres: e.target.value }))} />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowAddMovie(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAddMovie} loading={addingMovie}>Add Movie</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Show Modal */}
      {showAddShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddShow(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Create Show</h2>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Movie</label>
                <select value={showForm.movieId} onChange={e => setShowForm(f => ({ ...f, movieId: e.target.value }))}
                  className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none">
                  <option value="">Select movie</option>
                  {(movies ?? []).map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Screen</label>
                <select value={showForm.screenId} onChange={e => setShowForm(f => ({ ...f, screenId: e.target.value }))}
                  className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none">
                  <option value="">Select screen</option>
                  {(screens.data ?? []).map((s: Record<string, unknown>) => <option key={s.id as string} value={s.id as string}>{s.name as string}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Date" type="date" value={showForm.date} onChange={e => setShowForm(f => ({ ...f, date: e.target.value }))} />
                <Input label="Time" type="time" value={showForm.time} onChange={e => setShowForm(f => ({ ...f, time: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Language" placeholder="English" value={showForm.language} onChange={e => setShowForm(f => ({ ...f, language: e.target.value }))} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Format</label>
                  <select value={showForm.format} onChange={e => setShowForm(f => ({ ...f, format: e.target.value }))}
                    className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none">
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="4DX">4DX</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="VIP Price" placeholder="500" value={showForm.vipPrice} onChange={e => setShowForm(f => ({ ...f, vipPrice: e.target.value }))} />
                <Input label="Premium Price" placeholder="350" value={showForm.premiumPrice} onChange={e => setShowForm(f => ({ ...f, premiumPrice: e.target.value }))} />
                <Input label="Regular Price" placeholder="200" value={showForm.regularPrice} onChange={e => setShowForm(f => ({ ...f, regularPrice: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowAddShow(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAddShow} loading={addingShow}>Create Show</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
