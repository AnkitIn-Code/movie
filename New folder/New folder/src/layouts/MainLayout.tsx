import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ToastContainer } from '../components/ui/Toast';
import { TrailerModal } from '../modals/TrailerModal';
import { ShareModal } from '../modals/ShareModal';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
      <TrailerModal />
      <ShareModal />
    </div>
  );
}
