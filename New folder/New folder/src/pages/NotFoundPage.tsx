import { Link } from 'react-router-dom';
import { Home, Film } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-9xl font-black text-gray-100 dark:text-gray-800 mb-4">404</div>
        <Film className="w-16 h-16 text-red-500 mx-auto -mt-8 mb-4" />
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-gray-400 mb-6">The page you're looking for has left the cinema.</p>
        <Link to="/">
          <Button size="lg">
            <Home className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
