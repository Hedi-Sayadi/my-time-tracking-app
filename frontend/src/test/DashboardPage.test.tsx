import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import { AuthProvider } from '../hooks/useAuth';
import * as authApi from '../api/auth';
import * as tasksApi from '../api/tasks';
import * as projectsApi from '../api/projects';
import { ReactNode } from 'react';

const user = {
  id: 1,
  username: 'tester',
  email: 't@t.com',
  timezone: null,
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

const overview = {
  period: 'today',
  totalDurationSeconds: 7200,
  tasks: [
    {
      id: 1,
      description: 'Dash task',
      startTime: '2024-01-01T10:00:00Z',
      endTime: '2024-01-01T12:00:00Z',
      running: false,
      durationSeconds: 7200,
      projects: [{ id: 1, name: 'Project One' }],
      userId: 1,
      username: 'tester',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T12:00:00Z',
    },
  ],
  from: '2024-01-01',
  to: '2024-01-01',
};

const projects = [
  {
    id: 1,
    name: 'Project One',
    description: 'first',
    parentId: null,
    subprojects: [],
    ownerId: 1,
    ownerUsername: 'tester',
    members: [],
    budgetHours: null,
    spentSeconds: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const goal = {
  targetHours: 10,
  spentSeconds: 7200,
  progressPercent: 20,
  weekStart: '2024-01-01',
  weekEnd: '2024-01-07',
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue(useQueryMock(user) as any);
    vi.spyOn(authApi, 'useWeeklyGoal').mockReturnValue(useQueryMock(goal) as any);
    vi.spyOn(tasksApi, 'useTaskOverview').mockReturnValue(useQueryMock(overview) as any);
    vi.spyOn(tasksApi, 'useActiveTask').mockReturnValue(useQueryMock(null) as any);
    vi.spyOn(tasksApi, 'useTasks').mockReturnValue(useQueryMock([]) as any);
    vi.spyOn(tasksApi, 'useStartTask').mockReturnValue({
      mutateAsync: vi.fn(),
      mutate: vi.fn(),
      isPending: false,
      isIdle: true,
      isSuccess: false,
      isError: false,
      error: null,
      status: 'idle',
      reset: vi.fn(),
    } as any);
    vi.spyOn(tasksApi, 'useStopTask').mockReturnValue({
      mutateAsync: vi.fn(),
      mutate: vi.fn(),
      isPending: false,
      isIdle: true,
      isSuccess: false,
      isError: false,
      error: null,
      status: 'idle',
      reset: vi.fn(),
    } as any);
    vi.spyOn(tasksApi, 'useResumeTask').mockReturnValue({
      mutateAsync: vi.fn(),
      mutate: vi.fn(),
      isPending: false,
      isIdle: true,
      isSuccess: false,
      isError: false,
      error: null,
      status: 'idle',
      reset: vi.fn(),
    } as any);
    vi.spyOn(tasksApi, 'useDeleteTask').mockReturnValue({
      mutateAsync: vi.fn(),
      mutate: vi.fn(),
      isPending: false,
      isIdle: true,
      isSuccess: false,
      isError: false,
      error: null,
      status: 'idle',
      reset: vi.fn(),
    } as any);
    vi.spyOn(projectsApi, 'useProjects').mockReturnValue(useQueryMock(projects) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the hero title', () => {
    render(<DashboardPage />, { wrapper });

    expect(screen.getByText('Keep track of your work')).toBeInTheDocument();
    expect(screen.getByText('without the clutter.')).toBeInTheDocument();
  });

  it('renders metric cards', () => {
    render(<DashboardPage />, { wrapper });

    expect(screen.getByText('Tracked today')).toBeInTheDocument();
    expect(screen.getByText('2h 0m')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Running timer')).toBeInTheDocument();
  });

  it('renders project count value', () => {
    render(<DashboardPage />, { wrapper });

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders the weekly goal section', () => {
    render(<DashboardPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /your weekly goal/i })).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('renders the timer card', () => {
    render(<DashboardPage />, { wrapper });

    expect(screen.getAllByText('No active task').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Ready to start tracking')).toBeInTheDocument();
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('renders the recent tasks list with task description', () => {
    render(<DashboardPage />, { wrapper });

    expect(screen.getByText('Dash task')).toBeInTheDocument();
    expect(screen.getByText('Recent tasks')).toBeInTheDocument();
  });
});