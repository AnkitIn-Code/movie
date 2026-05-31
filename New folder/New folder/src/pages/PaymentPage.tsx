import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, ChevronRight, Lock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { bookingService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/helpers';

type PaymentMethod = 'upi' | 'card' | 'wallet';
type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

const WALLETS = ['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik'];
const UPI_APPS = [
  { name: 'Google Pay', icon: 'G' },
  { name: 'PhonePe', icon: 'P' },
  { name: 'BHIM', icon: 'B' },
  { name: 'Paytm', icon: 'P' },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const {
    show, selectedSeats, totalAmount, convenienceFee, subtotal, discount, coupon,
    setConfirmedBooking, setPaymentId, reset,
  } = useBookingStore();
  const { userId } = useAuthStore();
  const { addToast } = useUIStore();

  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');

  const handlePay = async () => {
    if (method === 'upi' && !upiId.trim()) {
      addToast('Please enter a UPI ID', 'warning');
      return;
    }
    setStatus('processing');
    try {
      // Create booking in database
      const bookingId = await bookingService.create({
        userId: userId!,
        showId: show?.id ?? '',
        seats: selectedSeats,
        totalAmount: totalAmount(),
        convenienceFee: convenienceFee(),
        discount,
        couponCode: coupon ?? undefined,
        paymentMethod: method,
      });

      // Simulate payment processing
      await new Promise(r => setTimeout(r, 2000));
      const paymentId = `pay_${Date.now()}`;

      // Update payment status
      await bookingService.updatePaymentStatus(bookingId, paymentId, 'success');

      setConfirmedBooking(bookingId);
      setPaymentId(paymentId);
      setStatus('success');
      setTimeout(() => {
        reset();
        navigate(`/booking/success/${bookingId}`);
      }, 1500);
    } catch (err) {
      setStatus('failed');
      addToast('Payment failed. Please try again.', 'error');
    }
  };

  const handleRetry = () => setStatus('idle');

  if (!show || selectedSeats.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">No booking in progress.</p>
        <Button onClick={() => { reset(); navigate('/'); }}>Browse Movies</Button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-950/40 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-400 mb-1">Amount Paid: <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount())}</span></p>
          <p className="text-gray-400 text-sm">Redirecting to your ticket...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <XMark />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Payment Failed</h2>
          <p className="text-gray-400 mb-6">Something went wrong. Please try again.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRetry} variant="secondary">
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
            <Button onClick={() => { reset(); navigate('/'); }}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black mb-6">Payment</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
            {([
              { id: 'upi', label: 'UPI', icon: Smartphone },
              { id: 'card', label: 'Card', icon: CreditCard },
              { id: 'wallet', label: 'Wallet', icon: Wallet },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  method === id
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {method === 'upi' && (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              <h3 className="font-bold">Pay via UPI</h3>
              <div className="grid grid-cols-2 gap-3">
                {UPI_APPS.map(app => (
                  <button key={app.name} onClick={() => setUpiId(`user@${app.name.toLowerCase().replace(' ', '')}`)}
                    className="flex items-center gap-3 p-3 border-2 rounded-xl border-gray-200 dark:border-gray-700 hover:border-red-500 transition-all">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-950/30 rounded-lg flex items-center justify-center text-red-600 font-bold text-sm">{app.icon}</div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{app.name}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <Input
                  label="Or enter UPI ID manually"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  leftIcon={<Smartphone className="w-4 h-4" />}
                />
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              <h3 className="font-bold">Credit / Debit Card</h3>
              <Input label="Card Number" placeholder="1234 5678 9012 3456" leftIcon={<CreditCard className="w-4 h-4" />} />
              <Input label="Cardholder Name" placeholder="Full name on card" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Expiry Date" placeholder="MM/YY" />
                <Input label="CVV" placeholder="***" type="password" />
              </div>
            </div>
          )}

          {method === 'wallet' && (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
              <h3 className="font-bold">Select Wallet</h3>
              {WALLETS.map(wallet => (
                <button key={wallet} className="w-full flex items-center justify-between p-4 border-2 rounded-xl border-gray-200 dark:border-gray-700 hover:border-red-500 transition-all">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{wallet}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-24">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Tickets ({selectedSeats.length})</span>
                <span>{formatCurrency(subtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Convenience Fee</span>
                <span>{formatCurrency(convenienceFee())}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({coupon})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 mt-3 pt-3 mb-5">
              <div className="flex justify-between font-black text-gray-900 dark:text-white text-lg">
                <span>Total</span>
                <span>{formatCurrency(totalAmount())}</span>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handlePay} loading={status === 'processing'}>
              <Lock className="w-4 h-4" />
              Pay {formatCurrency(totalAmount())}
            </Button>
            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> 100% Secure Payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function XMark() {
  return (
    <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
