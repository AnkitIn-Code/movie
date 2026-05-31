import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Sun, Moon, Ticket, User, LogOut, Settings, ChevronDown, Menu, X } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { movieService } from '../services/api';
import type { Movie } from '../types';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];

export function Header() {
  const { theme, toggleTheme, city, setCity } = useUIStore();
  const { isAuthenticated, name, role, signOut } = useAuthStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      try {
        const results = await movieService.search(searchQuery);
        setSearchResults(results.slice(0, 5));
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSearchResults([]);
      }
      setShowCityDropdown(false);
      setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl text-gray-900 dark:text-white hidden sm:block">
            Cine<span className="text-red-600">Book</span>
          </span>
        </Link>

        <div className="relative hidden md:block">
          <button
            onClick={e => { e.stopPropagation(); setShowCityDropdown(v => !v); }}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <MapPin className="w-4 h-4 text-red-500" />
            {city}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showCityDropdown && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl py-2 w-44 z-50">
              {CITIES.map(c => (
                <button
                  key={c}
                  onClick={() => { setCity(c); setShowCityDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    city === c
                      ? 'text-red-600 font-semibold bg-red-50 dark:bg-red-950/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={searchRef} className="flex-1 max-w-lg relative">
          <div className={`flex items-center gap-2 bg-gray-100 dark:bg-gray-800/80 rounded-xl px-3 py-2.5 border transition-all duration-200 ${
            showSearch ? 'border-red-500 ring-2 ring-red-500/20' : 'border-transparent'
          }`}>
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search movies, events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
              {searchResults.map(movie => (
                <button
                  key={movie.id}
                  onClick={() => { navigate(`/movies/${movie.id}`); setShowSearch(false); setSearchQuery(''); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded-lg" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{movie.title}</p>
                    <p className="text-xs text-gray-400">{movie.genres.join(' / ')}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setShowUserMenu(v => !v); }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {name?.[0] ?? 'U'}
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl py-2 w-48 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                    <p className="text-xs text-gray-400 capitalize">{role} Account</p>
                  </div>
                  <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  {role === 'provider' && (
                    <Link to="/provider/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Settings className="w-4 h-4" /> Provider Dashboard
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden sm:inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              Sign In
            </Link>
          )}

          <button onClick={() => setMobileMenuOpen(v => !v)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {CITIES.map(c => (
              <button key={c} onClick={() => { setCity(c); setMobileMenuOpen(false); }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  city === c ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}>
                {c}
              </button>
            ))}
          </div>
          {!isAuthenticated && (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}
              className="block bg-red-600 text-white text-center text-sm font-semibold py-2.5 rounded-xl">
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
