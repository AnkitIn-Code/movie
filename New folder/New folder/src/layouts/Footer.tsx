import { Link } from 'react-router-dom';
import { Ticket, Twitter, Instagram, Facebook, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-gray-800">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl text-white">Cine<span className="text-red-600">Book</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Your one-stop destination for movie tickets, events, and live entertainment.
            </p>
            <div className="flex gap-3">
              {[Twitter, Instagram, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Movies</h4>
            <ul className="space-y-2 text-sm">
              {['Now Showing', 'Coming Soon', 'Top Rated', 'Genres'].map(item => (
                <li key={item}><Link to="/" className="hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Help</h4>
            <ul className="space-y-2 text-sm">
              {['FAQ', 'Contact Us', 'T&C', 'Privacy Policy'].map(item => (
                <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Cities</h4>
            <ul className="space-y-2 text-sm">
              {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'].map(city => (
                <li key={city}><a href="#" className="hover:text-white transition-colors">{city}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-center text-xs mt-6">© 2025 CineBook. All rights reserved.</p>
      </div>
    </footer>
  );
}
