import { X, Copy, Check, Share2, MessageCircle, Mail } from 'lucide-react';
import { useState } from 'react';
import { useUIStore } from '../store/uiStore';

export function ShareModal() {
  const { shareOpen, shareData, closeShare } = useUIStore();
  const [copied, setCopied] = useState(false);

  if (!shareOpen || !shareData) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareData.url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareData.title, url: shareData.url });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeShare}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <button onClick={closeShare} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Share</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 truncate">{shareData.title}</p>

        <div className="flex items-center gap-2 mb-5 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
          <input
            type="text"
            readOnly
            value={shareData.url}
            className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none truncate"
          />
          <button onClick={handleCopy} className="shrink-0 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={handleWebShare} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Share2 className="w-6 h-6 text-blue-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Share</span>
          </button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareData.title + ' ' + shareData.url)}`)} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <MessageCircle className="w-6 h-6 text-green-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">WhatsApp</span>
          </button>
          <button onClick={() => window.open(`mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.url)}`)} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Mail className="w-6 h-6 text-red-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}
