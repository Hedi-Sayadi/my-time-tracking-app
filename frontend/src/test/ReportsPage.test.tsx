import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ReportsPage from '../pages/ReportsPage';
import { AuthProvider } from '../hooks/useAuth';
import * as authApi from '../api/auth';
import * as tasksApi from '../api/tasks';
import { ReactNode } from 'react';

const user = {
  id: 1,
  username: 'tester',
  email: 't@t.com',
  timezone: null,
  weeklyTargetHours: null,
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

const overview = {
  period: 'today',
  totalDurationSeconds: 5400,
  tasks: [
    {
      id: 1,
      description: 'Report task',
      startTime: '2024-01-01T10:00:00Z',
      endTime: '2024-01-01T11:30:00Z',
      running: false,
      durationSeconds: 5400,
      projects: [{ id: 1, name: 'Project X' }],
      userId: 1,
      username: 'tester',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T11:30:00Z',
    },
  ],
  from: '2024-01-01',
  to: '2024-01-01',
};

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue(useQueryMock(user) as any);
    vi.spyOn(tasksApi, 'useTaskOverview').mockReturnValue(useQueryMock(overview) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the report page header', () => {
    render(<ReportsPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /see where the time went/i })).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders period buttons', () => {
    render(<ReportsPage />, { wrapper });

    expect(screen.getByRole('button', { name: /^today$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /this week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /this month/i })).toBeInTheDocument();
  });

  it('renders the summary heading for today', () => {
    render(<ReportsPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /today's summary/i })).toBeInTheDocument();
  });

  it('renders total time and task count metrics', () => {
    render(<ReportsPage />, { wrapper });

    expect(screen.getByText('Total time')).toBeInTheDocument();
    expect(screen.getByText('1h 30m')).toBeInTheDocument();
    expect(screen.getByText(/across 1 tasks/i)).toBeInTheDocument();
  });

  it('renders task rows', () => {
    render(<ReportsPage />, { wrapper });

    expect(screen.getByText('Report task')).toBeInTheDocument();
    expect(screen.getByText('Project X')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('switches period to week', () => {
    render(<ReportsPage />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /this week/i }));

    expect(tasksApi.useTaskOverview).toHaveBeenCalledWith('week');
  });

  it('shows loading state', () => {
    vi.spyOn(tasksApi, 'useTaskOverview').mockReturnValue({ ...useQueryMock(null), isLoading: true, isPending: true, isSuccess: false, status: 'pending' } as any);
    render(<ReportsPage />, { wrapper });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    vi.spyOn(tasksApi, 'useTaskOverview').mockReturnValue(useQueryMock({ ...overview, tasks: [], totalDurationSeconds: 0 }) as any);
    render(<ReportsPage />, { wrapper });

    expect(screen.getByText(/no tasks for this period/i)).toBeInTheDocument();
  });
});