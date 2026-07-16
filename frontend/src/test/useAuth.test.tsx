import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>{children}</AuthProvider>
  </QueryClientProvider>
);

// Mock useCurrentUser
vi.mock('../api/auth', () => ({
  useLogin: vi.fn(),
  useRegister: vi.fn(),
  useCurrentUser: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useChangePassword: vi.fn(),
}));

function TestComponent() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="auth-state">{auth.isAuthenticated ? 'authenticated' : 'unauthenticated'}</span>
      <button onClick={() => auth.login('test-token')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should be unauthenticated by default', () => {
    render(<TestComponent />, { wrapper });
    
    expect(screen.getByTestId('auth-state')).toHaveTextContent('unauthenticated');
  });

  it('should be authenticated when token is in localStorage', () => {
    localStorage.setItem('token', 'existing-token');
    render(<TestComponent />, { wrapper });
    
    expect(screen.getByTestId('auth-state')).toHaveTextContent('authenticated');
  });

  it('should login and store token', () => {
    render(<TestComponent />, { wrapper });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(localStorage.getItem('token')).toBe('test-token');
    expect(screen.getByTestId('auth-state')).toHaveTextContent('authenticated');
  });

  it('should logout and remove token', () => {
    localStorage.setItem('token', 'test-token');
    render(<TestComponent />, { wrapper });
    
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    
    expect(localStorage.getItem('token')).toBeNull();
  });
});
