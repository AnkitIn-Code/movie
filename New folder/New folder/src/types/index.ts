export interface Movie {
  id: string;
  title: string;
  poster: string;
  banner: string;
  trailer?: string;
  rating: number;
  votes: number;
  duration: number;
  languages: string[];
  genres: string[];
  releaseDate: string;
  description: string;
  cast: CastMember[];
  director: string;
  certification: string;
  status: 'now_showing' | 'upcoming' | 'trending';
}

export interface CastMember {
  id: string;
  name: string;
  role: string;
  photo: string;
}

export interface Theatre {
  id: string;
  name: string;
  location: string;
  city: string;
  amenities: string[];
  shows: Show[];
}

export interface Screen {
  id: string;
  name: string;
  capacity: number;
  screenType: string;
  theatreId: string;
}

export interface Show {
  id: string;
  movieId: string;
  theatreId: string;
  theatreName: string;
  theatreLocation: string;
  date: string;
  time: string;
  language: string;
  format: string;
  availableSeats: number;
  totalSeats: number;
  pricing: SeatPricing;
}

export interface SeatPricing {
  vip: number;
  premium: number;
  regular: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'vip' | 'premium' | 'regular';
  status: 'available' | 'booked' | 'locked' | 'selected';
  price: number;
}

export interface SeatLayout {
  showId: string;
  sections: SeatSection[];
}

export interface SeatSection {
  type: 'vip' | 'premium' | 'regular';
  label: string;
  rows: SeatRow[];
  price: number;
}

export interface SeatRow {
  row: string;
  seats: Seat[];
}

export interface Booking {
  id: string;
  userId: string;
  showId: string;
  movieTitle: string;
  moviePoster: string;
  theatreName: string;
  theatreLocation: string;
  showDate: string;
  showTime: string;
  seats: SelectedSeat[];
  totalAmount: number;
  convenienceFee: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  qrCode?: string;
}

export interface SelectedSeat {
  seatId: string;
  row: string;
  number: number;
  type: 'vip' | 'premium' | 'regular';
  price: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  favoriteMovies: string[];
  savedPayments: SavedPayment[];
}

export interface SavedPayment {
  id: string;
  type: 'upi' | 'card' | 'wallet';
  label: string;
  last4?: string;
  upiId?: string;
}

export interface AdminAnalytics {
  totalRevenue: number;
  totalBookings: number;
  activeShows: number;
  totalMovies: number;
  revenueByDay: { date: string; revenue: number }[];
  bookingsByGenre: { genre: string; count: number }[];
  topMovies: { title: string; bookings: number; revenue: number }[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export type City = 'Mumbai' | 'Delhi' | 'Bangalore' | 'Chennai' | 'Hyderabad' | 'Pune' | 'Kolkata';
