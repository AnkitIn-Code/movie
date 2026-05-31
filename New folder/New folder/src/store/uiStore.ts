import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  theme: 'light' | 'dark';
  city: string;
  toasts: Toast[];
  trailerOpen: boolean;
  trailerUrl: string | null;
  shareOpen: boolean;
  shareData: { title: string; url: string } | null;

  toggleTheme: () => void;
  setCity: (city: string) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  openTrailer: (url: string) => void;
  closeTrailer: () => void;
  openShare: (title: string, url: string) => void;
  closeShare: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem('theme') as 'light' | 'dark') ?? 'dark',
  city: localStorage.getItem('city') ?? 'Mumbai',
  toasts: [],
  trailerOpen: false,
  trailerUrl: null,
  shareOpen: false,
  shareData: null,

  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    return { theme: next };
  }),

  setCity: (city) => {
    localStorage.setItem('city', city);
    set({ city });
  },

  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  openTrailer: (url) => set({ trailerOpen: true, trailerUrl: url }),
  closeTrailer: () => set({ trailerOpen: false, trailerUrl: null }),

  openShare: (title, url) => set({ shareOpen: true, shareData: { title, url } }),
  closeShare: () => set({ shareOpen: false, shareData: null }),
}));
