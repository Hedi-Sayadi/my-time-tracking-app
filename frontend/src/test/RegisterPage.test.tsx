import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage';
import { AuthProvider } from '../hooks/useAuth';
import * as authApi from '../api/auth';
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

const useQueryMock = (data: any) => ({
  data,
  isLoading: false,
  isPending: false,
  isError: false,
  error: null,
  isSuccess: true,
  status: 'success',
  fetchStatus: 'idle',
  isFetching: false,
  isInitialLoading: false,
  refetch: vi.fn(),
  promise: Promise.resolve(null),
});

const mutationMock = (overrides: Partial<any> = {}) => ({
  mutateAsync: vi.fn().mockResolvedValue({ token: 'test-token', user: { id: 1, username: 'tester' } }),
  mutate: vi.fn(),
  isPending: false,
  isIdle: true,
  isSuccess: false,
  isError: false,
  error: null,
  status: 'idle',
  reset: vi.fn(),
  ...overrides,
});

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue(useQueryMock(null) as any);
    vi.spyOn(authApi, 'useRegister').mockReturnValue(mutationMock() as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the registration form', () => {
    render(<RegisterPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^register$/i })).toBeInTheDocument();
  });

  it('shows login link', () => {
    render(<RegisterPage />, { wrapper });

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });

  it('submits with valid data', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ token: 'tok', user: { id: 1, username: 'u' } });
    vi.spyOn(authApi, 'useRegister').mockReturnValue({ ...mutationMock(), mutateAsync } as any);

    render(<RegisterPage />, { wrapper });

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@test.com',
        password: 'password123',
      });
    });
  });

  it('shows creating account text when pending', () => {
    vi.spyOn(authApi, 'useRegister').mockReturnValue(mutationMock({ isPending: true }) as any);

    render(<RegisterPage />, { wrapper });

    expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
  });

  it('should show error when registration fails', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({ response: { data: { detail: 'Username taken' } } });
    vi.spyOn(authApi, 'useRegister').mockReturnValue({ ...mutationMock(), mutateAsync } as any);

    render(<RegisterPage />, { wrapper });

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(screen.getByText('Username taken')).toBeInTheDocument();
    });
  });
});