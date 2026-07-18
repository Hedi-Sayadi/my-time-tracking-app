import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TimerCard from '../components/TimerCard';
import { ReactNode } from 'react';
import * as tasksApi from '../api/tasks';
import * as authApi from '../api/auth';
import * as projectsApi from '../api/projects';
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

  it('should start timer when start button clicked', async () => {
    const user = { id: 1, username: 'test' };
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue({
      data: user, isLoading: false, isPending: false, isError: false, error: null,
      isSuccess: true, status: 'success', fetchStatus: 'idle', isFetching: false,
      isInitialLoading: false, refetch: vi.fn(), promise: Promise.resolve(user),
    } as any);

    vi.spyOn(tasksApi, 'useActiveTask').mockReturnValue({
      data: null, isLoading: false, isPending: false, isError: false, error: null,
      isSuccess: true, status: 'success', fetchStatus: 'idle', isFetching: false,
      isInitialLoading: false, refetch: vi.fn(), promise: Promise.resolve(null),
    } as any);

    const mockProjects = [{ id: 1, name: 'Project A', description: '', parentId: null, subprojects: [], ownerId: 1, ownerUsername: 'test', members: [], budgetHours: null, spentSeconds: null, createdAt: '' }];
    vi.spyOn(projectsApi, 'useProjects').mockReturnValue({
      data: mockProjects, isLoading: false, isPending: false, isError: false, error: null,
      isSuccess: true, status: 'success', fetchStatus: 'idle', isFetching: false,
      isInitialLoading: false, refetch: vi.fn(), promise: Promise.resolve(mockProjects),
    } as any);

    const myTasks = [
      { id: 1, description: 'Recent task', startTime: new Date().toISOString(), endTime: new Date().toISOString(), running: false, durationSeconds: 3600, projects: [{ id: 1, name: 'Project A' }], userId: 1, username: 'test', createdAt: '', updatedAt: '' },
    ];
    vi.spyOn(tasksApi, 'useTasks').mockReturnValue({
      data: myTasks, isLoading: false, isPending: false, isError: false, error: null,
      isSuccess: true, status: 'success', fetchStatus: 'idle', isFetching: false,
      isInitialLoading: false, refetch: vi.fn(), promise: Promise.resolve(myTasks),
    } as any);

    const mockStart = vi.fn().mockResolvedValue({ id: 2, description: 'Test', startTime: '', endTime: null, running: true, durationSeconds: 0, projects: [], userId: 1, username: 'test', createdAt: '', updatedAt: '' });
    vi.spyOn(tasksApi, 'useStartTask').mockReturnValue({
      mutateAsync: mockStart, mutate: mockStart, isPending: false, isIdle: true,
      isSuccess: false, isError: false, error: null, status: 'idle', reset: vi.fn(),
    } as any);

    render(<TimerCard />, { wrapper });

    // Recent tasks dropdown should be visible
    expect(screen.getByText(/continue a recent task/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/what are you working on/i);
    await userEvent.type(input, 'Test task');

    const checkbox = screen.getByLabelText(/project a/i);
    await userEvent.click(checkbox);

    const startBtn = screen.getByRole('button', { name: /start timer/i });
    await userEvent.click(startBtn);

    expect(mockStart).toHaveBeenCalled();

    // Select "New task" from dropdown
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, '0');

    // Click Add entry button
    const addEntryBtn = screen.getByRole('button', { name: /add entry/i });
    await userEvent.click(addEntryBtn);
  });

  it('should stop timer when stop button clicked', async () => {
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue({
      data: { id: 1, username: 'test' }, isLoading: false, isPending: false, isError: false, error: null,
      isSuccess: true, status: 'success', fetchStatus: 'idle', isFetching: false,
      isInitialLoading: false, refetch: vi.fn(), promise: Promise.resolve({ id: 1, username: 'test' }),
    } as any);

    const activeTask = { id: 1, description: 'Running task', startTime: new Date().toISOString(), endTime: null, running: true, durationSeconds: 0, projects: [{ id: 1, name: 'Project A' }], userId: 1, username: 'test', createdAt: '', updatedAt: '' };
    vi.spyOn(tasksApi, 'useActiveTask').mockReturnValue({
      data: activeTask, isLoading: false, isPending: false, isError: false, error: null,
      isSuccess: true, status: 'success', fetchStatus: 'idle', isFetching: false,
      isInitialLoading: false, refetch: vi.fn(), promise: Promise.resolve(activeTask),
    } as any);

    const mockStop = vi.fn().mockResolvedValue({ id: 1, description: 'Running task', startTime: '', endTime: '', running: false, durationSeconds: 300, projects: [{ id: 1, name: 'Project A' }], userId: 1, username: 'test', createdAt: '', updatedAt: '' });
    vi.spyOn(tasksApi, 'useStopTask').mockReturnValue({
      mutateAsync: mockStop, mutate: mockStop, isPending: false, isIdle: true,
      isSuccess: false, isError: false, error: null, status: 'idle', reset: vi.fn(),
    } as any);

    vi.spyOn(tasksApi, 'useStartTask').mockReturnValue({
      mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false, isIdle: true,
      isSuccess: false, isError: false, error: null, status: 'idle', reset: vi.fn(),
    } as any);

    vi.spyOn(tasksApi, 'useResumeTask').mockReturnValue({
      mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false, isIdle: true,
      isSuccess: false, isError: false, error: null, status: 'idle', reset: vi.fn(),
    } as any);

    vi.spyOn(tasksApi, 'useDeleteTask').mockReturnValue({
      mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false, isIdle: true,
      isSuccess: false, isError: false, error: null, status: 'idle', reset: vi.fn(),
    } as any);

    render(<TimerCard />, { wrapper });

    // Running state should show project pill
    expect(screen.getByText('Project A')).toBeInTheDocument();

    const stopBtn = screen.getByRole('button', { name: /stop timer/i });
    await userEvent.click(stopBtn);

    expect(mockStop).toHaveBeenCalledWith(1);
  });

  it('should resume, log time, and cancel paused task', async () => {
    vi.spyOn(authApi, 'useCurrentUser').mockReturnValue({
      data: { id: 1, username: 'test' }, isLoading: false, isPending: false, isError: false, error: null,
      isSuccess: true, status: 'success', fetchStatus: 'idle', isFetching: false,
      isInitialLoading: false, refetch: vi.fn(), promise: Promise.resolve({ id: 1, username: 'test' }),
    } as any);

    const stoppedTask = { id: 1, description: 'Paused task', startTime: '', endTime: '', running: false, durationSeconds: 300, projects: [], userId: 1, username: 'test', createdAt: '', updatedAt: '' };

    let activeTaskData: any = { id: 1, description: 'Paused task', startTime: new Date().toISOString(), endTime: null, running: true, durationSeconds: 0, projects: [], userId: 1, username: 'test', createdAt: '', updatedAt: '' };

    vi.spyOn(tasksApi, 'useActiveTask').mockImplementation(() => ({
      data: activeTaskData, isLoading: false, isPending: false, isError: false, error: null,
      isSuccess: true, status: 'success', fetchStatus: 'idle', isFetching: false,
      isInitialLoading: false, refetch: vi.fn(), promise: Promise.resolve(activeTaskData),
    }) as any);

    const mockStop = vi.fn().mockResolvedValue(stoppedTask);
    vi.spyOn(tasksApi, 'useStopTask').mockReturnValue({
      mutateAsync: mockStop, mutate: mockStop, isPending: false, isIdle: true,
      isSuccess: false, isError: false, error: null, status: 'idle', reset: vi.fn(),
    } as any);

    const mockResume = vi.fn().mockResolvedValue({ ...stoppedTask, running: true, endTime: null });
    vi.spyOn(tasksApi, 'useResumeTask').mockReturnValue({
      mutateAsync: mockResume, mutate: mockResume, isPending: false, isIdle: true,
      isSuccess: false, isError: false, error: null, status: 'idle', reset: vi.fn(),
    } as any);

    const mockDelete = vi.fn().mockResolvedValue({});
    vi.spyOn(tasksApi, 'useDeleteTask').mockReturnValue({
      mutateAsync: mockDelete, mutate: mockDelete, isPending: false, isIdle: true,
      isSuccess: false, isError: false, error: null, status: 'idle', reset: vi.fn(),
    } as any);

    vi.spyOn(tasksApi, 'useStartTask').mockReturnValue({
      mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false, isIdle: true,
      isSuccess: false, isError: false, error: null, status: 'idle', reset: vi.fn(),
    } as any);

    const { rerender } = render(<TimerCard />, { wrapper });

    const stopBtn = screen.getByRole('button', { name: /stop timer/i });
    await userEvent.click(stopBtn);

    // Update activeTask to null so component sees paused state
    activeTaskData = null;
    rerender(<TimerCard />);

    const resumeBtn = screen.getByRole('button', { name: /resume/i });
    await userEvent.click(resumeBtn);
    expect(mockResume).toHaveBeenCalledWith(1);

    // Reset for cancel test
    activeTaskData = { id: 1, description: 'Paused task', startTime: new Date().toISOString(), endTime: null, running: true, durationSeconds: 0, projects: [], userId: 1, username: 'test', createdAt: '', updatedAt: '' };
    rerender(<TimerCard />);
    await userEvent.click(screen.getByRole('button', { name: /stop timer/i }));
    activeTaskData = null;
    rerender(<TimerCard />);

    const logBtn = screen.getByRole('button', { name: /log time/i });
    await userEvent.click(logBtn);

    // Reset for cancel test
    activeTaskData = { id: 1, description: 'Paused task', startTime: new Date().toISOString(), endTime: null, running: true, durationSeconds: 0, projects: [], userId: 1, username: 'test', createdAt: '', updatedAt: '' };
    rerender(<TimerCard />);
    await userEvent.click(screen.getByRole('button', { name: /stop timer/i }));
    activeTaskData = null;
    rerender(<TimerCard />);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelBtn);
    expect(mockDelete).toHaveBeenCalledWith(1);
  });
});
