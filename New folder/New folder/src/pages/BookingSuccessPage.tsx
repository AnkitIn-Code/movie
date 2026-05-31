import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Download, Share2, QrCode, MapPin, Clock, Users, Calendar } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { useUIStore } from '../store/uiStore';
import { bookingService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDate } from '../utils/helpers';

function QRCodeDisplay({ value }: { value: string }) {
  return (
    <div className="w-36 h-36 bg-white border-4 border-gray-900 dark:border-white rounded-xl flex items-center justify-center mx-auto">
      <div className="grid grid-cols-5 gap-0.5">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className={`w-5 h-5 ${value.charCodeAt(i % value.length) % 3 === 0 ? 'bg-gray-900' : 'bg-white'}`} />
        ))}
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { confirmedBookingId } = useBookingStore();
  const { addToast, openShare } = useUIStore();

  const { data: booking } = useFetch(
    () => bookingService.getById(bookingId ?? confirmedBookingId ?? ''),
    [bookingId, confirmedBookingId]
  );

  const handleDownload = () => {
    // Create a simple text ticket for download
    const ticketText = [
      'CINEBOOK TICKET',
      '================',
      `Booking ID: ${booking?.id?.toUpperCase()}`,
      `Movie: ${booking?.movieTitle}`,
      `Theatre: ${booking?.theatreName}`,
      `Location: ${booking?.theatreLocation}`,
      `Date: ${booking?.showDate}`,
      `Time: ${booking?.showTime}`,
      `Amount: ${formatCurrency(booking?.totalAmount ?? 0)}`,
      '================',
      'Show this QR code at the entrance',
    ].join('\n');

    const blob = new Blob([ticketText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinebook-ticket-${booking?.id?.substring(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Ticket downloaded!', 'success');
  };

  const handleShare = () => {
    openShare(
      `CineBook Ticket - ${booking?.movieTitle}`,
      `${window.location.origin}/booking/success/${booking?.id}`
    );
  };

  if (!booking) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-500">Loading booking details...</p>
        <Link to="/"><Button>Back to Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Booking Confirmed!</h1>
        <p className="text-gray-400 mt-1">Your tickets are ready. Have a great time!</p>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-red-700 to-red-900 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="default" size="md">CONFIRMED</Badge>
              <h2 className="text-xl font-black mt-2">{booking.movieTitle}</h2>
              <p className="text-red-200 text-sm mt-0.5">{booking.theatreName}</p>
            </div>
            {booking.moviePoster && (
              <img src={booking.moviePoster} alt={booking.movieTitle} className="w-16 h-22 rounded-xl object-cover border-2 border-white/20" />
            )}
          </div>
        </div>

        <div className="relative flex items-center">
          <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-950 -ml-3 shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
          <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-950 -mr-3 shrink-0" />
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</p>
              <p className="font-bold text-sm">{formatDate(booking.showDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Time</p>
              <p className="font-bold text-sm">{booking.showTime}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Venue</p>
              <p className="font-bold text-sm">{booking.theatreLocation}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Users className="w-3 h-3" /> Booking ID</p>
              <p className="font-bold text-sm font-mono">{booking.id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <p className="text-center text-xs text-gray-400 mb-3 flex items-center justify-center gap-1">
              <QrCode className="w-3.5 h-3.5" /> Scan at the theatre entrance
            </p>
            <QRCodeDisplay value={booking.qrCode ?? booking.id} />
            <p className="text-center text-xs font-mono text-gray-500 mt-3">{booking.id.toUpperCase()}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-6 flex justify-between items-center">
            <span className="text-sm text-gray-500">Total Paid</span>
            <span className="font-black text-lg text-gray-900 dark:text-white">{formatCurrency(booking.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" className="flex-1" size="lg" onClick={handleDownload}>
          <Download className="w-4 h-4" /> Download Ticket
        </Button>
        <Button variant="outline" className="flex-1" size="lg" onClick={handleShare}>
          <Share2 className="w-4 h-4" /> Share
        </Button>
      </div>
      <div className="text-center mt-4">
        <Link to="/" className="text-red-600 hover:text-red-700 text-sm font-medium">
          Browse More Movies
        </Link>
      </div>
    </div>
  );
}
