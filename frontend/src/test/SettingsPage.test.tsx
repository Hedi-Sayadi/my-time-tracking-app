import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import SettingsPage from '../pages/SettingsPage';
import { AuthProvider } from '../hooks/useAuth';
import * as authApi from '../api/auth';
import { ReactNode } from 'react';

const user = {
  id: 1,
  username: 'tester',
  email: 't@t.com',
  timezone: 'Europe/Berlin',
  weeklyTargetHours: 10,
  createdAt: '2024-01-01T00:00:00Z',
};

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
  mutateAsync: vi.fn().mockResolvedValue(user),
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

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue(useQueryMock(user) as any);
    vi.spyOn(authApi, 'useUpdateTimezone').mockReturnValue(mutationMock() as any);
    vi.spyOn(authApi, 'useUpdateWeeklyGoal').mockReturnValue(mutationMock() as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders account section', () => {
    render(<SettingsPage />, { wrapper });

    expect(screen.getByRole('heading', { level: 2, name: 'Account' })).toBeInTheDocument();
    expect(screen.getByText('Signed in as')).toBeInTheDocument();
    expect(screen.getByText('tester')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<SettingsPage />, { wrapper });

    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });

  it('renders weekly goal section with input prefilled', () => {
    render(<SettingsPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /weekly goal/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/target hours per week/i)).toHaveValue(10);
  });

  it('renders timezone section with select prefilled', () => {
    render(<SettingsPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /time zone/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/preferred time zone/i)).toHaveValue('Europe/Berlin');
  });

  it('saves the weekly goal and shows success message', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(user);
    vi.spyOn(authApi, 'useUpdateWeeklyGoal').mockReturnValue({
      ...mutationMock(),
      mutateAsync,
    } as any);

    render(<SettingsPage />, { wrapper });

    fireEvent.change(screen.getByLabelText(/target hours per week/i), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: /save goal/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(20);
      expect(screen.getByText('Weekly goal saved')).toBeInTheDocument();
    });
  });

  it('changes timezone and shows success message', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(user);
    vi.spyOn(authApi, 'useUpdateTimezone').mockReturnValue({
      ...mutationMock(),
      mutateAsync,
    } as any);

    render(<SettingsPage />, { wrapper });

    fireEvent.change(screen.getByLabelText(/preferred time zone/i), { target: { value: 'UTC' } });

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ timezone: 'UTC' });
      expect(screen.getByText('Timezone saved')).toBeInTheDocument();
    });
  });

  it('should show error when timezone save fails', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'));
    vi.spyOn(authApi, 'useUpdateTimezone').mockReturnValue({
      ...mutationMock(),
      mutateAsync,
    } as any);

    render(<SettingsPage />, { wrapper });

    fireEvent.change(screen.getByLabelText(/preferred time zone/i), { target: { value: 'UTC' } });

    await waitFor(() => {
      expect(screen.getByText('Failed to save timezone')).toBeInTheDocument();
    });
  });

  it('should show error when goal save fails', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'));
    vi.spyOn(authApi, 'useUpdateWeeklyGoal').mockReturnValue({
      ...mutationMock(),
      mutateAsync,
    } as any);

    render(<SettingsPage />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /save goal/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save goal')).toBeInTheDocument();
    });
  });

  it('should handle user with null timezone and goal', () => {
    const userNoTz = {
      id: 1,
      username: 'tester',
      email: 't@t.com',
      timezone: null,
      weeklyTargetHours: null,
      createdAt: '2024-01-01T00:00:00Z',
    };
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue(useQueryMock(userNoTz) as any);

    render(<SettingsPage />, { wrapper });

    expect(screen.getByLabelText(/target hours per week/i)).toHaveValue(0);
  });
});
