import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage'));
const SeatSelectionPage = lazy(() => import('./pages/SeatSelectionPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const BookingSuccessPage = lazy(() => import('./pages/BookingSuccessPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const ProviderLoginPage = lazy(() => import('./pages/ProviderLoginPage'));
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center gap-3 text-gray-400">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore(s => s.initialize);
  const theme = useUIStore(s => s.theme);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies" element={<Navigate to="/" replace />} />
              <Route path="/movies/:movieId" element={<MovieDetailPage />} />
              <Route path="/seats/:showId" element={
                <ProtectedRoute><SeatSelectionPage /></ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute><CheckoutPage /></ProtectedRoute>
              } />
              <Route path="/payment" element={
                <ProtectedRoute><PaymentPage /></ProtectedRoute>
              } />
              <Route path="/booking/success/:bookingId" element={
                <ProtectedRoute><BookingSuccessPage /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><UserProfilePage /></ProtectedRoute>
              } />
              <Route path="/provider/dashboard" element={
                <ProtectedRoute requireProvider><ProviderDashboard /></ProtectedRoute>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/provider/login" element={<ProviderLoginPage />} />
          </Routes>
        </Suspense>
      </AppInitializer>
    </BrowserRouter>
  );
}
