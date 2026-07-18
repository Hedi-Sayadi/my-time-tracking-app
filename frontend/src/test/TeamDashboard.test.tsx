import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TeamDashboard from '../components/TeamDashboard';
import * as projectsApi from '../api/projects';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const useQueryMock = (data: any, isLoading = false) => ({
  data,
  isLoading,
  isPending: isLoading,
  isError: false,
  error: null,
  isSuccess: !isLoading,
  status: isLoading ? 'pending' : 'success',
  fetchStatus: isLoading ? 'fetching' : 'idle',
  isFetching: isLoading,
  isInitialLoading: isLoading,
  refetch: vi.fn(),
  promise: Promise.resolve(null),
});

const contributions = [
  {
    userId: 1,
    username: 'alice',
    totalDurationSeconds: 3600,
    taskCount: 3,
    joinedAt: '2024-01-01T00:00:00Z',
  },
  {
    userId: 2,
    username: 'bob',
    totalDurationSeconds: 1800,
    taskCount: 1,
    joinedAt: '2024-01-01T00:00:00Z',
  },
];

describe('TeamDashboard', () => {
  beforeEach(() => {
    vi.spyOn(projectsApi, 'useProjectTeam').mockReturnValue(useQueryMock(contributions) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders metric cards for team members and total time', () => {
    render(<TeamDashboard projectId={1} ownerUsername="alice" />, { wrapper });

    expect(screen.getByText('Team members')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Total time')).toBeInTheDocument();
  });

  it('renders member contributions', () => {
    render(<TeamDashboard projectId={1} ownerUsername="alice" />, { wrapper });

    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('marks the owner', () => {
    render(<TeamDashboard projectId={1} ownerUsername="alice" />, { wrapper });

    expect(screen.getByText('(owner)')).toBeInTheDocument();
  });

  it('renders per-member task counts and durations', () => {
    render(<TeamDashboard projectId={1} ownerUsername="alice" />, { wrapper });

    expect(screen.getByText('1h 0m')).toBeInTheDocument();
    expect(screen.getByText('0h 30m')).toBeInTheDocument();
    expect(screen.getByText('3 tasks')).toBeInTheDocument();
    expect(screen.getByText('1 task')).toBeInTheDocument();
  });

  it('renders percentage of total', () => {
    render(<TeamDashboard projectId={1} ownerUsername="alice" />, { wrapper });

    expect(screen.getByText('66.7% of total project time')).toBeInTheDocument();
    expect(screen.getByText('33.3% of total project time')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.spyOn(projectsApi, 'useProjectTeam').mockReturnValue(useQueryMock(null, true) as any);
    render(<TeamDashboard projectId={1} ownerUsername="alice" />, { wrapper });

    expect(screen.getByText(/loading team data/i)).toBeInTheDocument();
  });

  it('shows empty state when no contributions', () => {
    vi.spyOn(projectsApi, 'useProjectTeam').mockReturnValue(useQueryMock([]) as any);
    render(<TeamDashboard projectId={1} ownerUsername="alice" />, { wrapper });

    expect(screen.getByText(/no contributions recorded yet/i)).toBeInTheDocument();
  });
});