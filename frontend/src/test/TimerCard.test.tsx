import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TimerCard from '../components/TimerCard';
import { ReactNode } from 'react';
import * as tasksApi from '../api/tasks';
import * as authApi from '../api/auth';
import { AuthProvider } from '../hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>{children}</AuthProvider>
  </QueryClientProvider>
);

describe('TimerCard', () => {
  beforeEach(() => {
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue({
      data: null,
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
    } as any);
  });

  it('should show no active task state when idle', () => {
    vi.spyOn(tasksApi, 'useActiveTask').mockReturnValue({
      data: null,
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
    } as any);

    render(<TimerCard />, { wrapper });

    expect(screen.getByText('No active task')).toBeInTheDocument();
    expect(screen.getByText('Ready to start tracking')).toBeInTheDocument();
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('should show start button when no task is running', () => {
    vi.spyOn(tasksApi, 'useActiveTask').mockReturnValue({
      data: null,
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
    } as any);

    render(<TimerCard />, { wrapper });

    expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
  });

  it('should show loading state', () => {
    vi.spyOn(tasksApi, 'useActiveTask').mockReturnValue({
      data: null,
      isLoading: true,
      isPending: true,
      isError: false,
      error: null,
      isSuccess: false,
      status: 'pending',
      fetchStatus: 'fetching',
      isFetching: true,
      isInitialLoading: true,
      refetch: vi.fn(),
      promise: Promise.resolve(null),
    } as any);

    render(<TimerCard />, { wrapper });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
