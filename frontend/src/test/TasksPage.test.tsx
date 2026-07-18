import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import TasksPage from '../pages/TasksPage';
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

const mutationMock = (overrides: Partial<any> = {}) => ({
  mutateAsync: vi.fn().mockResolvedValue({}),
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

const tasks = [
  {
    id: 1,
    description: 'Task One',
    startTime: '2024-01-01T10:00:00Z',
    endTime: '2024-01-01T11:00:00Z',
    running: false,
    durationSeconds: 3600,
    projects: [{ id: 1, name: 'Project X' }],
    userId: 1,
    username: 'tester',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T11:00:00Z',
  },
  {
    id: 2,
    description: 'Task Two',
    startTime: '2024-01-01T12:00:00Z',
    endTime: null,
    running: true,
    durationSeconds: 600,
    projects: [],
    userId: 2,
    username: 'other',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
  },
];

describe('TasksPage', () => {
  beforeEach(() => {
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue(useQueryMock(user) as any);
    vi.spyOn(tasksApi, 'useTasks').mockReturnValue(useQueryMock(tasks) as any);
    vi.spyOn(tasksApi, 'useDeleteTask').mockReturnValue(mutationMock() as any);
    vi.spyOn(tasksApi, 'useCreateTask').mockReturnValue(mutationMock() as any);
    vi.spyOn(tasksApi, 'useUpdateTask').mockReturnValue(mutationMock() as any);
    vi.spyOn(projectsApi, 'useProjects').mockReturnValue(useQueryMock([]) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the page header', () => {
    render(<TasksPage />, { wrapper });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /review, edit, and organize/i })
    ).toBeInTheDocument();
  });

  it('renders the add manual entry button', () => {
    render(<TasksPage />, { wrapper });

    expect(screen.getByRole('button', { name: /add manual entry/i })).toBeInTheDocument();
  });

  it('renders the task list heading', () => {
    render(<TasksPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /task list/i })).toBeInTheDocument();
  });

  it('renders task descriptions', () => {
    render(<TasksPage />, { wrapper });

    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.getByText('Task Two')).toBeInTheDocument();
  });

  it('renders edit and delete buttons only for the current user tasks', () => {
    render(<TasksPage />, { wrapper });

    expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
  });

  it('renders project tags for tasks with projects', () => {
    render(<TasksPage />, { wrapper });

    expect(screen.getByText('Project X')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.spyOn(tasksApi, 'useTasks').mockReturnValue(useQueryMock(null, true) as any);
    render(<TasksPage />, { wrapper });

    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    vi.spyOn(tasksApi, 'useTasks').mockReturnValue(useQueryMock([]) as any);
    render(<TasksPage />, { wrapper });

    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('should open add form when add manual entry clicked', async () => {
    render(<TasksPage />, { wrapper });

    const addBtn = screen.getByRole('button', { name: /add manual entry/i });
    await import('@testing-library/react').then(({ fireEvent }) => fireEvent.click(addBtn));

    expect(screen.getByRole('heading', { name: /new task/i })).toBeInTheDocument();
  });

  it('should open edit form when edit clicked', async () => {
    render(<TasksPage />, { wrapper });

    const editBtn = screen.getByRole('button', { name: /^edit$/i });
    await import('@testing-library/react').then(({ fireEvent }) => fireEvent.click(editBtn));

    expect(screen.getByRole('heading', { name: /edit task/i })).toBeInTheDocument();
  });
});
