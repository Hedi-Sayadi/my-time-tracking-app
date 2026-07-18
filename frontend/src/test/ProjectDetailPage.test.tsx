import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import ProjectDetailPage from '../pages/ProjectDetailPage';
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
  <MemoryRouter initialEntries={['/projects/1']}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  </MemoryRouter>
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

const project = {
  id: 1,
  name: 'Project Detail',
  description: 'A detailed project',
  parentId: null,
  subprojects: [],
  ownerId: 1,
  ownerUsername: 'tester',
  members: [],
  budgetHours: 20,
  spentSeconds: 7200,
  createdAt: '2024-01-01T00:00:00Z',
};

const members = [
  {
    id: 10,
    userId: 2,
    username: 'invitee',
    joinedAt: '2024-01-01T00:00:00Z',
  },
];

const budget = {
  projectId: 1,
  projectName: 'Project Detail',
  budgetHours: 20,
  spentSeconds: 7200,
};

const tasks = [
  {
    id: 100,
    description: 'Detail task',
    startTime: '2024-01-01T10:00:00Z',
    endTime: '2024-01-01T12:00:00Z',
    running: false,
    durationSeconds: 7200,
    projects: [{ id: 1, name: 'Project Detail' }],
    userId: 1,
    username: 'tester',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
  },
];

const timeData = {
  projectId: 1,
  projectName: 'Project Detail',
  totalDurationSeconds: 7200,
  taskCount: 1,
};

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue(useQueryMock(user) as any);
    vi.spyOn(projectsApi, 'useProject').mockReturnValue(useQueryMock(project) as any);
    vi.spyOn(projectsApi, 'useProjectMembers').mockReturnValue(useQueryMock(members) as any);
    vi.spyOn(projectsApi, 'useProjectBudget').mockReturnValue(useQueryMock(budget) as any);
    vi.spyOn(projectsApi, 'useShareProject').mockReturnValue(mutationMock() as any);
    vi.spyOn(projectsApi, 'useUnshareProject').mockReturnValue(mutationMock() as any);
    vi.spyOn(tasksApi, 'useProjectTime').mockReturnValue(useQueryMock(timeData) as any);
    vi.spyOn(tasksApi, 'useProjectTasks').mockReturnValue(useQueryMock(tasks) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the project name as heading', () => {
    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByRole('heading', { name: 'Project Detail' })).toBeInTheDocument();
  });

  it('renders the back to projects button', () => {
    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByRole('button', { name: /back to projects/i })).toBeInTheDocument();
  });

  it('renders the project description', () => {
    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByText('A detailed project')).toBeInTheDocument();
  });

  it('renders the owner meta line', () => {
    const { container } = render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByText(/owner:/i)).toBeInTheDocument();
    const meta = container.querySelector('.project-meta');
    expect(meta?.textContent).toContain('tester');
  });

  it('renders the budget bar', () => {
    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.getByText('2.0h / 20h')).toBeInTheDocument();
  });

  it('renders overview and team tabs', () => {
    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByRole('button', { name: /^overview$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^team$/i })).toBeInTheDocument();
  });

  it('renders the share project form for the owner', () => {
    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /share project/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter username to invite/i)).toBeInTheDocument();
  });

  it('renders the members list', () => {
    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /members/i })).toBeInTheDocument();
    expect(screen.getByText('invitee')).toBeInTheDocument();
  });

  it('renders the time frame section with export button', () => {
    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /select time frame/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
  });

  it('renders the tracked tasks table', () => {
    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /tracked tasks/i })).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Detail task')).toBeInTheDocument();
  });

  it('renders total time and tasks metric cards', () => {
    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByText('Total time')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Across all users')).toBeInTheDocument();
    expect(screen.getByText('Unique tasks (deduplicated)')).toBeInTheDocument();
  });

  it('renders the user filter dropdown when there are unique users', () => {
    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByText(/filter by user/i)).toBeInTheDocument();
  });

  it('should switch to team tab when clicked', async () => {
    render(<ProjectDetailPage />, { wrapper });

    const teamTab = screen.getByRole('button', { name: /^team$/i });
    await import('@testing-library/react').then(({ fireEvent }) => fireEvent.click(teamTab));

    expect(screen.queryByRole('heading', { name: /tracked tasks/i })).not.toBeInTheDocument();
  });

  it('should click export csv button', async () => {
    const mockExport = vi.fn().mockResolvedValue(new Blob(['csv']));
    vi.spyOn(tasksApi, 'exportProjectTasks').mockImplementation(mockExport);
    window.URL.createObjectURL = vi.fn(() => 'blob:url');
    window.URL.revokeObjectURL = vi.fn();
    const clickSpy = vi.spyOn(document.createElement('a'), 'click').mockImplementation(() => {});

    render(<ProjectDetailPage />, { wrapper });

    const exportBtn = screen.getByRole('button', { name: /export csv/i });
    await import('@testing-library/react').then(({ fireEvent }) => fireEvent.click(exportBtn));

    expect(mockExport).toHaveBeenCalled();
  });

  it('should share project when form submitted', async () => {
    const shareMutateAsync = vi.fn().mockResolvedValue({});
    vi.spyOn(projectsApi, 'useShareProject').mockReturnValue({
      mutateAsync: shareMutateAsync,
      mutate: shareMutateAsync,
      isPending: false,
      isIdle: true,
      isSuccess: false,
      isError: false,
      error: null,
      status: 'idle',
      reset: vi.fn(),
    } as any);

    render(<ProjectDetailPage />, { wrapper });

    const input = screen.getByPlaceholderText(/enter username to invite/i);
    await import('@testing-library/user-event').then(({ default: ue }) => ue.type(input, 'friend'));

    const shareBtn = screen.getByRole('button', { name: /^share$/i });
    await import('@testing-library/react').then(({ fireEvent }) => fireEvent.click(shareBtn));

    expect(shareMutateAsync).toHaveBeenCalled();
  });

  it('should remove member when remove clicked', async () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    );
    const unshareMutateAsync = vi.fn().mockResolvedValue({});
    vi.spyOn(projectsApi, 'useUnshareProject').mockReturnValue({
      mutateAsync: unshareMutateAsync,
      mutate: unshareMutateAsync,
      isPending: false,
      isIdle: true,
      isSuccess: false,
      isError: false,
      error: null,
      status: 'idle',
      reset: vi.fn(),
    } as any);

    render(<ProjectDetailPage />, { wrapper });

    const removeBtn = screen.getByRole('button', { name: /^remove$/i });
    await import('@testing-library/react').then(({ fireEvent }) => fireEvent.click(removeBtn));

    expect(unshareMutateAsync).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('should change user filter dropdown', async () => {
    render(<ProjectDetailPage />, { wrapper });

    const select = screen.getByLabelText(/filter by user/i);
    await import('@testing-library/react').then(({ fireEvent }) =>
      fireEvent.change(select, { target: { value: '1' } })
    );

    expect(select).toHaveValue('1');
  });

  it('should show members list for non-owner', () => {
    const nonOwnerUser = {
      id: 2,
      username: 'other',
      email: 'o@o.com',
      timezone: null,
      weeklyTargetHours: null,
      createdAt: '2024-01-01T00:00:00Z',
    };
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue(useQueryMock(nonOwnerUser) as any);

    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /project members/i })).toBeInTheDocument();
    expect(screen.getByText('(owner)')).toBeInTheDocument();
    expect(screen.getByText('invitee')).toBeInTheDocument();
  });

  it('should show over budget message', () => {
    const overBudget = {
      projectId: 1,
      projectName: 'Project Detail',
      budgetHours: 20,
      spentSeconds: 80000,
    };
    vi.spyOn(projectsApi, 'useProjectBudget').mockReturnValue(useQueryMock(overBudget) as any);

    render(<ProjectDetailPage />, { wrapper });

    expect(screen.getByText(/over budget/i)).toBeInTheDocument();
  });
});
