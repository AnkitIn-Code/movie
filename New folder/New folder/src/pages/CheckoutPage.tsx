import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, X, Ticket, MapPin, Clock, Users } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { useUIStore } from '../store/uiStore';
import { couponService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/helpers';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    show, selectedSeats, coupon, discount, applyCoupon, removeCoupon,
    subtotal, convenienceFee, totalAmount,
  } = useBookingStore();
  const { addToast } = useUIStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const result = await couponService.validate(couponInput.toUpperCase(), subtotal());
      if (result.valid) {
        applyCoupon(result.code, result.discount);
        addToast(`Coupon applied! You saved ${formatCurrency(result.discount)}`, 'success');
        setCouponInput('');
      } else {
        addToast('Invalid or expired coupon code', 'error');
      }
    } catch {
      addToast('Failed to validate coupon', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  if (!show || selectedSeats.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">No booking in progress.</p>
        <Button onClick={() => navigate('/')}>Browse Movies</Button>
      </div>
    );
  }

  const typeLabel = { vip: 'VIP', premium: 'Premium', regular: 'Regular' };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white">Booking Summary</h2>
            </div>
            <div className="p-5">
              <div className="flex gap-4">
                {show.moviePoster && (
                  <div className="w-16 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                    <img src={show.moviePoster} alt="Movie" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {show.movieTitle || `${show.language} - ${show.format}`}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{show.theatreName}</p>
                    <p className="text-xs text-gray-400">{show.theatreLocation}</p>
                    <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{show.date} | {show.time}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map(seat => (
                    <div key={seat.seatId} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{seat.row}{seat.number}</span>
                      <span className="text-xs text-gray-400">({typeLabel[seat.type]})</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(seat.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-600" /> Apply Coupon
            </h2>
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                <div>
                  <span className="font-bold text-green-700 dark:text-green-400">{coupon}</span>
                  <p className="text-xs text-green-600 dark:text-green-500">You saved {formatCurrency(discount)}</p>
                </div>
                <button onClick={removeCoupon} className="text-green-600 hover:text-green-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code (e.g. FIRST50)"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  leftIcon={<Ticket className="w-4 h-4" />}
                  className="flex-1"
                  onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                />
                <Button onClick={handleApplyCoupon} loading={couponLoading} variant="secondary">
                  Apply
                </Button>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">Available: MOVIE20, FIRST50, WEEKEND10</p>
          </div>
        </div>

        <div>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-24">
            <h2 className="font-bold mb-4">Price Details</h2>
            <div className="space-y-2.5 text-sm">
              {selectedSeats.map(seat => (
                <div key={seat.seatId} className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{seat.row}{seat.number} ({typeLabel[seat.type]})</span>
                  <span>{formatCurrency(seat.price)}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Convenience Fee</span>
                  <span>{formatCurrency(convenienceFee())}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Coupon ({coupon})</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5">
                <div className="flex justify-between font-black text-gray-900 dark:text-white text-base">
                  <span>Total Amount</span>
                  <span>{formatCurrency(totalAmount())}</span>
                </div>
              </div>
            </div>
            <Button className="w-full mt-5" size="lg" onClick={() => navigate('/payment')}>
              Proceed to Pay
            </Button>
            <p className="text-xs text-gray-400 text-center mt-3">Secure payment | No hidden charges</p>
          </div>
        </div>
      </div>
    </div>
  );
}
