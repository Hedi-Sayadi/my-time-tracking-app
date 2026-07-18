import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecentTasks from '../components/RecentTasks';
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

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

const tasks = [
  {
    id: 1,
    description: 'Task A',
    startTime: '2024-01-01T10:00:00Z',
    endTime: '2024-01-01T11:00:00Z',
    running: false,
    durationSeconds: 3600,
    projects: [{ id: 1, name: 'Project Alpha' }],
    userId: 1,
    username: 'tester',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T11:00:00Z',
  },
  {
    id: 2,
    description: 'Task B',
    startTime: '2024-01-01T12:00:00Z',
    endTime: null,
    running: true,
    durationSeconds: 1800,
    projects: [],
    userId: 1,
    username: 'tester',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
  },
];

describe('RecentTasks', () => {
  beforeEach(() => {
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue(useQueryMock(user) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the section heading', () => {
    render(<RecentTasks tasks={tasks} />, { wrapper });

    expect(screen.getByText('Recent tasks')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders task descriptions', () => {
    render(<RecentTasks tasks={tasks} />, { wrapper });

    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
  });

  it('renders project name for tasks with projects', () => {
    render(<RecentTasks tasks={tasks} />, { wrapper });

    expect(screen.getByText(/Project Alpha/)).toBeInTheDocument();
    expect(screen.getByText(/No project/)).toBeInTheDocument();
  });

  it('renders durations', () => {
    render(<RecentTasks tasks={tasks} />, { wrapper });

    expect(screen.getByText('01:00:00')).toBeInTheDocument();
    expect(screen.getByText('00:30:00')).toBeInTheDocument();
  });

  it('shows empty state message when no tasks', () => {
    render(<RecentTasks tasks={[]} />, { wrapper });

    expect(screen.getByText(/no tasks logged today yet/i)).toBeInTheDocument();
  });
});
