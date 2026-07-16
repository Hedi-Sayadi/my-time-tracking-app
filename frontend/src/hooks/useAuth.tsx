import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useCurrentUser } from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; username: string; email: string } | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const { data: user } = useCurrentUser();

  const login = useCallback((newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/login';
  }, []);

  const value: AuthContextType = {
    isAuthenticated: !!token,
    user: user ?? null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
