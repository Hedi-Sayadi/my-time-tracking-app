import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { AuthProvider } from '../hooks/useAuth';
import * as authApi from '../api/auth';
import { ReactNode } from 'react';

const user = {
  id: 1,
  username: 'tester',
  email: 't@t.com',
  timezone: null,
  weeklyTargetHours: null,
  createdAt: '2024-01-01T00:00:00Z',
};

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

describe('AppLayout', () => {
  beforeEach(() => {
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue(useQueryMock(user) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the sidebar brand', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('TimeTrack')).toBeInTheDocument();
  });

  it('renders the username when user is present', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('tester')).toBeInTheDocument();
  });

  it('renders the logout button', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /^dashboard$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^settings$/i })).toBeInTheDocument();
  });
});
