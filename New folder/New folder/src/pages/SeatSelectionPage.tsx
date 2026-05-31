import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Monitor, Clock, AlertCircle, Info } from 'lucide-react';
import { seatService, showService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { useCountdown } from '../hooks/useCountdown';
import { useUIStore } from '../store/uiStore';
import { SeatWebSocket } from '../websocket/seatSocket';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency } from '../utils/helpers';
import type { Seat } from '../types';

const SEAT_COLORS = {
  vip: {
    available: 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800/50 text-amber-900 dark:text-amber-200',
    selected: 'bg-amber-500 border-amber-600 text-white shadow-sm shadow-amber-500/40',
    booked: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed',
    locked: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 cursor-not-allowed text-orange-400',
  },
  premium: {
    available: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800/40 text-blue-900 dark:text-blue-200',
    selected: 'bg-blue-600 border-blue-700 text-white shadow-sm shadow-blue-500/40',
    booked: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed',
    locked: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 cursor-not-allowed text-orange-400',
  },
  regular: {
    available: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-800/30 text-green-900 dark:text-green-200',
    selected: 'bg-green-600 border-green-700 text-white shadow-sm shadow-green-500/40',
    booked: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed',
    locked: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 cursor-not-allowed text-orange-400',
  },
};

export default function SeatSelectionPage() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { selectedSeats, toggleSeat, show, setShow, totalAmount, convenienceFee, subtotal } = useBookingStore();
  const { isAuthenticated, userId } = useAuthStore();
  const { addToast } = useUIStore();
  const { formatted, expired } = useCountdown(300);
  const [locking, setLocking] = useState(false);
  const [seatStatuses, setSeatStatuses] = useState<Record<string, 'available' | 'booked' | 'locked'>>({});

  const { data: layout, loading } = useFetch(
    () => seatService.getLayout(showId!),
    [showId]
  );
  const { data: showData } = useFetch(
    () => showService.getById(showId!),
    [showId]
  );

  useEffect(() => {
    if (showData && !show) {
      setShow({
        id: showData.id,
        movieId: showData.movieId,
        movieTitle: '',
        moviePoster: '',
        theatreName: showData.theatreName,
        theatreLocation: showData.theatreLocation,
        screenName: showData.format,
        date: showData.date,
        time: showData.time,
        language: showData.language,
        format: showData.format,
        vipPrice: showData.pricing.vip,
        premiumPrice: showData.pricing.premium,
        regularPrice: showData.pricing.regular,
      });
    }
  }, [showData, show, setShow]);

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new SeatWebSocket(showId!);
    ws.connect();
    ws.onSeatUpdate((seatId, status) => {
      setSeatStatuses(prev => {
        if (selectedSeats.find(s => s.seatId === seatId)) return prev;
        return { ...prev, [seatId]: status };
      });
    });
    return () => ws.disconnect();
  }, [showId, selectedSeats]);

  useEffect(() => {
    if (expired) addToast('Session expired. Please re-select your seats.', 'warning');
  }, [expired, addToast]);

  const handleSeatClick = (seat: Seat) => {
    if (!isAuthenticated) {
      addToast('Please sign in to select seats', 'warning');
      navigate('/login');
      return;
    }
    const status = seatStatuses[seat.id] ?? seat.status;
    if (status === 'booked' || status === 'locked') return;
    toggleSeat({ seatId: seat.id, row: seat.row, number: seat.number, type: seat.type, price: seat.price });
  };

  const handleProceed = async () => {
    if (selectedSeats.length === 0) { addToast('Please select at least one seat', 'warning'); return; }
    setLocking(true);
    try {
      await seatService.lockSeats(showId!, selectedSeats.map(s => s.seatId), userId!);
      navigate('/checkout');
    } catch {
      addToast('Failed to lock seats. Please try again.', 'error');
    } finally {
      setLocking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{show?.theatreName ?? 'Select Seats'}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{show?.date} | {show?.time} | {show?.language} | {show?.format}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold ${
          expired ? 'bg-red-100 dark:bg-red-950/40 text-red-600' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
        }`}>
          <Clock className="w-4 h-4" /> {formatted}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50/80 dark:bg-blue-950/30 backdrop-blur-sm px-3 py-2 rounded-lg mb-6">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <Info className="w-3.5 h-3.5" />
        Real-time seat availability enabled. Seats update as others book.
      </div>

      <div className="relative mb-10">
        <div className="w-3/4 mx-auto h-2 bg-gradient-to-b from-gray-300 dark:from-gray-600 to-transparent rounded-full" />
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-400">
          <Monitor className="w-4 h-4" /> SCREEN
        </div>
      </div>

      {layout && (
        <div className="space-y-8">
          {layout.sections.map(section => (
            <div key={section.type}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm ${
                    section.type === 'vip' ? 'bg-amber-400' :
                    section.type === 'premium' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">{section.label}</h3>
                </div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{formatCurrency(section.price)}</span>
              </div>
              <div className="space-y-2">
                {section.rows.map(row => (
                  <div key={row.row} className="flex items-center gap-2">
                    <span className="w-5 text-xs text-gray-400 font-mono text-center flex-shrink-0">{row.row}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {row.seats.map((seat, idx) => {
                        const status = seatStatuses[seat.id] ?? seat.status;
                        const isSelected = selectedSeats.some(s => s.seatId === seat.id);
                        const effectiveStatus = isSelected ? 'selected' : status;
                        const colors = SEAT_COLORS[seat.type];
                        const colorClass = colors[effectiveStatus as keyof typeof colors] ?? colors.available;

                        return (
                          <>
                            {idx === Math.floor(row.seats.length / 2) && (
                              <div key={`gap-${row.row}`} className="w-4" />
                            )}
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat)}
                              disabled={status === 'booked' || status === 'locked'}
                              className={`w-7 h-7 text-xs font-medium rounded-t-md border transition-all duration-150 ${colorClass}`}
                              title={`${seat.row}${seat.number} - ${formatCurrency(seat.price)}`}
                            >
                              {seat.number}
                            </button>
                          </>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-8 justify-center text-xs">
        {[
          { color: 'bg-green-500', label: 'Available' },
          { color: 'bg-blue-600', label: 'Selected' },
          { color: 'bg-gray-300 dark:bg-gray-600', label: 'Booked' },
          { color: 'bg-orange-400', label: 'Locked' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <span className={`w-4 h-4 rounded-sm ${color}`} />
            {label}
          </div>
        ))}
      </div>

      {selectedSeats.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 mt-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-1.5 mb-1">
                {selectedSeats.map(s => (
                  <span key={s.seatId} className="text-xs font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                    {s.row}{s.number}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</span>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className="font-bold text-gray-900 dark:text-white">Subtotal: {formatCurrency(subtotal())}</span>
                {convenienceFee() > 0 && <span className="text-gray-400 text-xs">+ Rs.{convenienceFee()} fee</span>}
              </div>
            </div>
            <Button size="lg" onClick={handleProceed} loading={locking} className="shrink-0">
              Pay {formatCurrency(totalAmount())}
            </Button>
          </div>
          {selectedSeats.length >= 8 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" /> Maximum 8 seats per booking.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
