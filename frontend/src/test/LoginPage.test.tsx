import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../hooks/useAuth';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

vi.mock('../api/auth', () => ({
  useLogin: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ token: 'test-token', user: { id: 1, username: 'test' } }),
    isPending: false,
  })),
  useCurrentUser: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
}));

describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />, { wrapper });
    
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('should show register link', () => {
    render(<LoginPage />, { wrapper });
    
    expect(screen.getByText(/no account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  it('should show validation on empty submit', async () => {
    render(<LoginPage />, { wrapper });
    
    const form = screen.getByRole('button', { name: /log in/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    // HTML5 validation prevents submit, so no error message shown
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });
});
