import axios from 'axios';
import type { Movie, Show, Theatre, SeatLayout, Booking, SelectedSeat } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export function setApiAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

// ==========================================
// Movie Service
// ==========================================
export const movieService = {
  async getAll(): Promise<Movie[]> {
    const { data } = await apiClient.get<Record<string, unknown>[]>('/api/movies');
    return (data ?? []).map(normalizeMovie);
  },

  async getTrending(): Promise<Movie[]> {
    const { data } = await apiClient.get<Record<string, unknown>[]>('/api/movies', {
      params: { status: 'trending' },
    });
    return (data ?? []).map(normalizeMovie);
  },

  async getUpcoming(): Promise<Movie[]> {
    const { data } = await apiClient.get<Record<string, unknown>[]>('/api/movies', {
      params: { status: 'upcoming' },
    });
    return (data ?? []).map(normalizeMovie);
  },

  async getById(id: string): Promise<Movie | null> {
    const { data } = await apiClient.get<Record<string, unknown> | null>(`/api/movies/${id}`);
    return data ? normalizeMovie(data) : null;
  },

  async search(query: string): Promise<Movie[]> {
    const { data } = await apiClient.get<Record<string, unknown>[]>('/api/movies/search', {
      params: { q: query },
    });
    return (data ?? []).map(normalizeMovie);
  },

  async create(movie: Partial<Movie>, userId: string): Promise<Movie> {
    const payload = { ...movie, userId };
    const { data } = await apiClient.post<Record<string, unknown>>('/api/movies', payload);
    return normalizeMovie(data);
  },

  async update(id: string, updates: Partial<Movie>): Promise<Movie> {
    const { data } = await apiClient.put<Record<string, unknown>>(`/api/movies/${id}`, updates);
    return normalizeMovie(data);
  },
};

// ==========================================
// Show Service
// ==========================================
export const showService = {
  async getByMovie(movieId: string): Promise<Show[]> {
    const { data } = await apiClient.get<Record<string, unknown>[]>(`/api/movies/${movieId}/shows`);
    return (data ?? []).map(normalizeShow);
  },

  async getById(showId: string): Promise<Show | null> {
    const { data } = await apiClient.get<Record<string, unknown> | null>(`/api/shows/${showId}`);
    return data ? normalizeShow(data) : null;
  },

  async create(show: { movieId: string; screenId: string; date: string; time: string; language: string; format: string; vipPrice: number; premiumPrice: number; regularPrice: number }, userId: string): Promise<Show> {
    const payload = { ...show, userId };
    const { data } = await apiClient.post<Record<string, unknown>>('/api/shows', payload);
    return normalizeShow(data);
  },
};

// ==========================================
// Theatre Service
// ==========================================
export const theatreService = {
  async getByMovie(movieId: string): Promise<Theatre[]> {
    const { data } = await apiClient.get<Theatre[]>(`/api/movies/${movieId}/theatres`);
    return data ?? [];
  },

  async getAll(): Promise<Theatre[]> {
    const { data } = await apiClient.get<Theatre[]>('/api/theatres');
    return data ?? [];
  },

  async getScreens(theatreId: string) {
    const { data } = await apiClient.get(`/api/theatres/${theatreId}/screens`);
    return data ?? [];
  },
};

// ==========================================
// Seat Service
// ==========================================
export const seatService = {
  async getLayout(showId: string): Promise<SeatLayout> {
    const { data } = await apiClient.get<SeatLayout>(`/api/shows/${showId}/seat-layout`);
    return data;
  },

  async lockSeats(showId: string, seatIds: string[], userId: string): Promise<boolean> {
    await apiClient.post(`/api/shows/${showId}/seats/lock`, { seatIds, userId });
    return true;
  },

  async unlockSeats(showId: string, seatIds: string[]): Promise<boolean> {
    await apiClient.post(`/api/shows/${showId}/seats/unlock`, { seatIds });
    return true;
  },

  async bookSeats(showId: string, seatIds: string[]): Promise<boolean> {
    await apiClient.post(`/api/shows/${showId}/seats/book`, { seatIds });
    return true;
  },
};

// ==========================================
// Booking Service
// ==========================================
export const bookingService = {
  async create(params: {
    userId: string; showId: string; seats: SelectedSeat[];
    totalAmount: number; convenienceFee: number; discount: number;
    couponCode?: string; paymentMethod: string;
  }): Promise<string> {
    const { data } = await apiClient.post<{ id: string }>('/api/bookings', params);
    if (!data?.id) throw new Error('Failed to create booking');
    return data.id;
  },

  async getById(bookingId: string): Promise<Booking | null> {
    const { data } = await apiClient.get<Record<string, unknown> | null>(`/api/bookings/${bookingId}`);
    return data ? normalizeBooking(data) : null;
  },

  async getByUser(userId: string): Promise<Booking[]> {
    const { data } = await apiClient.get<Record<string, unknown>[]>(`/api/users/${userId}/bookings`);
    return (data ?? []).map(normalizeBooking);
  },

  async updatePaymentStatus(bookingId: string, paymentId: string, status: string): Promise<void> {
    await apiClient.patch(`/api/bookings/${bookingId}/payment`, { paymentId, status });
  },

  async cancelBooking(bookingId: string, userId: string): Promise<void> {
    await apiClient.post(`/api/bookings/${bookingId}/cancel`, { userId });
  },
};

// ==========================================
// Favorites Service
// ==========================================
export const favoriteService = {
  async getByUser(userId: string): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(`/api/users/${userId}/favorites`);
    return data ?? [];
  },

  async toggle(userId: string, movieId: string): Promise<boolean> {
    const { data } = await apiClient.post<{ isFavorite: boolean }>(`/api/users/${userId}/favorites/toggle`, { movieId });
    return data?.isFavorite ?? false;
  },
};

// ==========================================
// Coupon Service
// ==========================================
export const couponService = {
  async validate(code: string, amount: number): Promise<{ valid: boolean; discount: number; code: string }> {
    const { data } = await apiClient.post<{ valid: boolean; discount: number; code: string }>(
      '/api/coupons/validate',
      { code, amount }
    );
    return data;
  },
};

// ==========================================
// Analytics Service (for provider)
// ==========================================
export const analyticsService = {
  async getProviderStats(userId: string) {
    const { data } = await apiClient.get(`/api/providers/${userId}/stats`);
    return data;
  },
};

// ==========================================
// Mappers
// ==========================================
function normalizeMovie(row: Record<string, unknown>): Movie {
  if (typeof row.id === 'string' && 'poster' in row && 'banner' in row) {
    return row as Movie;
  }
  return {
    id: row.id as string,
    title: (row.title as string) ?? '',
    poster: (row.poster as string) ?? (row.poster_url as string) ?? '',
    banner: (row.banner as string) ?? (row.banner_url as string) ?? '',
    trailer: (row.trailer as string) ?? (row.trailer_url as string) ?? '',
    rating: Number(row.rating ?? 0),
    votes: Number(row.votes ?? 0),
    duration: Number(row.duration ?? 120),
    languages: (row.languages as string[]) ?? [],
    genres: (row.genres as string[]) ?? [],
    releaseDate: (row.releaseDate as string) ?? (row.release_date ? String(row.release_date) : ''),
    description: (row.description as string) ?? '',
    cast: [],
    director: (row.director as string) ?? '',
    certification: (row.certification as string) ?? 'U',
    status: (row.status as Movie['status']) ?? 'now_showing',
  };
}

function normalizeShow(row: Record<string, unknown>): Show {
  if (typeof row.id === 'string' && 'movieId' in row) {
    return row as Show;
  }
  const screen = row.screens as Record<string, unknown> | null;
  const theatre = screen?.theatres as Record<string, unknown> | null;
  return {
    id: row.id as string,
    movieId: (row.movieId as string) ?? (row.movie_id as string),
    theatreId: (row.theatreId as string) ?? (theatre?.id as string) ?? '',
    theatreName: (row.theatreName as string) ?? (theatre?.name as string) ?? '',
    theatreLocation: (row.theatreLocation as string) ?? (theatre?.location as string) ?? '',
    date: (row.date as string) ?? (row.show_date ? String(row.show_date) : ''),
    time: (row.time as string) ?? (row.show_time ? formatTime(row.show_time as string) : ''),
    language: (row.language as string) ?? 'English',
    format: (row.format as string) ?? '2D',
    availableSeats: Number(row.availableSeats ?? 0),
    totalSeats: Number(row.totalSeats ?? 0),
    pricing: {
      vip: Number((row as Record<string, unknown>).vipPrice ?? row.vip_price ?? 500),
      premium: Number((row as Record<string, unknown>).premiumPrice ?? row.premium_price ?? 350),
      regular: Number((row as Record<string, unknown>).regularPrice ?? row.regular_price ?? 200),
    },
  };
}

function normalizeBooking(row: Record<string, unknown>): Booking {
  if (typeof row.id === 'string' && 'movieTitle' in row) {
    return row as Booking;
  }
  const show = row.shows as Record<string, unknown> | null;
  const movie = show?.movies as Record<string, unknown> | null;
  const screen = show?.screens as Record<string, unknown> | null;
  const theatre = screen?.theatres as Record<string, unknown> | null;
  return {
    id: row.id as string,
    userId: (row.userId as string) ?? (row.user_id as string),
    showId: (row.showId as string) ?? (row.show_id as string),
    movieTitle: (row.movieTitle as string) ?? (movie?.title as string) ?? '',
    moviePoster: (row.moviePoster as string) ?? (movie?.poster_url as string) ?? '',
    theatreName: (row.theatreName as string) ?? (theatre?.name as string) ?? '',
    theatreLocation: (row.theatreLocation as string) ?? (theatre?.location as string) ?? '',
    showDate: (row.showDate as string) ?? (show?.show_date as string) ?? '',
    showTime: (row.showTime as string) ?? (show?.show_time ? formatTime(show.show_time as string) : ''),
    seats: [],
    totalAmount: Number((row as Record<string, unknown>).totalAmount ?? row.total_amount ?? 0),
    convenienceFee: Number((row as Record<string, unknown>).convenienceFee ?? row.convenience_fee ?? 0),
    status: (row.status as Booking['status']) ?? 'pending',
    createdAt: (row.createdAt as string) ?? (row.created_at as string) ?? '',
    qrCode: ((row as Record<string, unknown>).qrCode as string) ?? (row.id as string).substring(0, 8).toUpperCase(),
  };
}

function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}
