import { apiClient, setApiAuthToken } from './api';

export type AuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: 'user' | 'provider';
};

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  role?: 'user' | 'provider';
};

const TOKEN_KEY = 'auth_token';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors (private mode, blocked storage, etc.)
  }
}

const initialToken = getStoredToken();
if (initialToken) {
  setApiAuthToken(initialToken);
}

export const AuthService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const { data } = await apiClient.post<{ user: AuthUser; token?: string }>(
      '/api/auth/login',
      { email, password }
    );
    if (data?.token) {
      storeToken(data.token);
      setApiAuthToken(data.token);
    }
    return data.user;
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const { data } = await apiClient.post<{ user: AuthUser; token?: string }>(
      '/api/auth/register',
      payload
    );
    if (data?.token) {
      storeToken(data.token);
      setApiAuthToken(data.token);
    }
    return data.user;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      storeToken(null);
      setApiAuthToken(null);
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data } = await apiClient.get<AuthUser | null>('/api/auth/me');
      return data ?? null;
    } catch {
      return null;
    }
  },
};
