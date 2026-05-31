import { create } from 'zustand';
import type { SelectedSeat } from '../types';

interface ShowInfo {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  theatreName: string;
  theatreLocation: string;
  screenName: string;
  date: string;
  time: string;
  language: string;
  format: string;
  vipPrice: number;
  premiumPrice: number;
  regularPrice: number;
}

interface BookingState {
  show: ShowInfo | null;
  selectedSeats: SelectedSeat[];
  coupon: string | null;
  discount: number;
  confirmedBookingId: string | null;
  paymentId: string | null;

  setShow: (show: ShowInfo) => void;
  toggleSeat: (seat: SelectedSeat) => void;
  clearSeats: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  setConfirmedBooking: (id: string) => void;
  setPaymentId: (id: string) => void;
  reset: () => void;

  subtotal: () => number;
  convenienceFee: () => number;
  totalAmount: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  show: null,
  selectedSeats: [],
  coupon: null,
  discount: 0,
  confirmedBookingId: null,
  paymentId: null,

  setShow: (show) => set({ show, selectedSeats: [] }),

  toggleSeat: (seat) => set((state) => {
    const exists = state.selectedSeats.find(s => s.seatId === seat.seatId);
    if (exists) {
      return { selectedSeats: state.selectedSeats.filter(s => s.seatId !== seat.seatId) };
    }
    if (state.selectedSeats.length >= 8) return state;
    return { selectedSeats: [...state.selectedSeats, seat] };
  }),

  clearSeats: () => set({ selectedSeats: [] }),

  applyCoupon: (code, discount) => set({ coupon: code, discount }),

  removeCoupon: () => set({ coupon: null, discount: 0 }),

  setConfirmedBooking: (id) => set({ confirmedBookingId: id }),

  setPaymentId: (id) => set({ paymentId: id }),

  reset: () => set({
    show: null, selectedSeats: [], coupon: null, discount: 0,
    confirmedBookingId: null, paymentId: null,
  }),

  subtotal: () => get().selectedSeats.reduce((sum, s) => sum + s.price, 0),
  convenienceFee: () => get().selectedSeats.length > 0 ? 49 : 0,
  totalAmount: () => {
    const s = get();
    return Math.max(0, s.subtotal() + s.convenienceFee() - s.discount);
  },
}));
