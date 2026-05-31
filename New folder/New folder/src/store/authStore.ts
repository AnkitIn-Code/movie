import { create } from 'zustand';
import { AuthService, type AuthUser } from '../services/auth';

type UserRole = 'user' | 'provider';

interface AuthState {
  user: AuthUser | null;
  userId: string | null;
  email: string | null;
  name: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsProvider: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userId: null,
  email: null,
  name: null,
  role: 'user',
  isAuthenticated: false,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        set({
          user,
          userId: user.id,
          email: user.email ?? null,
          name: user.name ?? user.email?.split('@')[0] ?? null,
          role: user.role ?? 'user',
          isAuthenticated: true,
          initialized: true,
        });
      } else {
        set({ initialized: true });
      }
    } catch {
      set({ initialized: true });
    }
  },

  signUp: async (email, password, name) => {
    set({ loading: true });
    try {
      const user = await AuthService.register({ email, password, name, role: 'user' });
      if (user) {
        set({
          user,
          userId: user.id,
          email: user.email ?? null,
          name: user.name ?? user.email?.split('@')[0] ?? null,
          role: user.role ?? 'user',
          isAuthenticated: true,
        });
      }
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const user = await AuthService.login(email, password);
      set({
        user,
        userId: user.id,
        email: user.email ?? null,
        name: user.name ?? user.email?.split('@')[0] ?? null,
        role: user.role ?? 'user',
        isAuthenticated: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  signInAsProvider: async (email, password) => {
    set({ loading: true });
    try {
      const user = await AuthService.login(email, password);
      set({
        user,
        userId: user.id,
        email: user.email ?? null,
        name: user.name ?? user.email?.split('@')[0] ?? null,
        role: 'provider',
        isAuthenticated: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await AuthService.logout();
    set({
      user: null, userId: null, email: null, name: null,
      role: 'user', isAuthenticated: false,
    });
  },

  setRole: (role) => set({ role }),
}));
