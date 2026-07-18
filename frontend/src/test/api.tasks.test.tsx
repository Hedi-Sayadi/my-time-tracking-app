import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

vi.mock('../api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../api/client';
import {
  useTasks,
  useActiveTask,
  useStartTask,
  useStopTask,
  useResumeTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useTaskOverview,
  useProjectTime,
  useProjectTasks,
  exportProjectTasks,
} from '../api/tasks';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Tasks API hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('useTasks should get /tasks', async () => {
    const mockData = [
      {
        id: 1,
        description: 'Test',
        startTime: '',
        endTime: null,
        running: false,
        durationSeconds: 3600,
        projects: [],
        userId: 1,
        username: 'test',
        createdAt: '',
        updatedAt: '',
      },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(apiClient.get).toHaveBeenCalledWith('/tasks');
  });

  it('useActiveTask should get /tasks/active with 204 returning null', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ status: 204, data: null });

    const { result } = renderHook(() => useActiveTask(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
    expect(apiClient.get).toHaveBeenCalledWith('/tasks/active');
  });

  it('useActiveTask should get /tasks/active with data', async () => {
    const mockData = {
      id: 1,
      description: 'Test',
      startTime: '',
      endTime: null,
      running: true,
      durationSeconds: 0,
      projects: [],
      userId: 1,
      username: 'test',
      createdAt: '',
      updatedAt: '',
    };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ status: 200, data: mockData });

    const { result } = renderHook(() => useActiveTask(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it('useStartTask should post to /tasks/start', async () => {
    const mockData = {
      id: 1,
      description: 'Test',
      startTime: '',
      endTime: null,
      running: true,
      durationSeconds: 0,
      projects: [],
      userId: 1,
      username: 'test',
      createdAt: '',
      updatedAt: '',
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useStartTask(), { wrapper });
    const data = await result.current.mutateAsync({ description: 'Test' });
    expect(data).toEqual(mockData);
    expect(apiClient.post).toHaveBeenCalledWith('/tasks/start', { description: 'Test' });
  });

  it('useStopTask should post to /tasks/:id/stop', async () => {
    const mockData = {
      id: 1,
      description: 'Test',
      startTime: '',
      endTime: '',
      running: false,
      durationSeconds: 3600,
      projects: [],
      userId: 1,
      username: 'test',
      createdAt: '',
      updatedAt: '',
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useStopTask(), { wrapper });
    const data = await result.current.mutateAsync(1);
    expect(data).toEqual(mockData);
    expect(apiClient.post).toHaveBeenCalledWith('/tasks/1/stop');
  });

  it('useResumeTask should post to /tasks/:id/resume', async () => {
    const mockData = {
      id: 1,
      description: 'Test',
      startTime: '',
      endTime: null,
      running: true,
      durationSeconds: 0,
      projects: [],
      userId: 1,
      username: 'test',
      createdAt: '',
      updatedAt: '',
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useResumeTask(), { wrapper });
    const data = await result.current.mutateAsync(1);
    expect(data).toEqual(mockData);
    expect(apiClient.post).toHaveBeenCalledWith('/tasks/1/resume');
  });

  it('useCreateTask should post to /tasks', async () => {
    const mockData = {
      id: 1,
      description: 'Test',
      startTime: '',
      endTime: '',
      running: false,
      durationSeconds: 3600,
      projects: [],
      userId: 1,
      username: 'test',
      createdAt: '',
      updatedAt: '',
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useCreateTask(), { wrapper });
    const data = await result.current.mutateAsync({
      description: 'Test',
      startTime: '',
      endTime: '',
      projectIds: [1],
    });
    expect(data).toEqual(mockData);
    expect(apiClient.post).toHaveBeenCalledWith('/tasks', {
      description: 'Test',
      startTime: '',
      endTime: '',
      projectIds: [1],
    });
  });

  it('useUpdateTask should put to /tasks/:id', async () => {
    const mockData = {
      id: 1,
      description: 'Updated',
      startTime: '',
      endTime: '',
      running: false,
      durationSeconds: 3600,
      projects: [],
      userId: 1,
      username: 'test',
      createdAt: '',
      updatedAt: '',
    };
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useUpdateTask(), { wrapper });
    const data = await result.current.mutateAsync({
      id: 1,
      data: { description: 'Updated', startTime: '', endTime: '' },
    });
    expect(data).toEqual(mockData);
    expect(apiClient.put).toHaveBeenCalledWith('/tasks/1', {
      description: 'Updated',
      startTime: '',
      endTime: '',
    });
  });

  it('useDeleteTask should delete /tasks/:id', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteTask(), { wrapper });
    await result.current.mutateAsync(1);
    expect(apiClient.delete).toHaveBeenCalledWith('/tasks/1');
  });

  it('useTaskOverview should get /tasks/overview', async () => {
    const mockData = { period: 'today', totalDurationSeconds: 3600, tasks: [], from: '', to: '' };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useTaskOverview('today'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith('/tasks/overview?period=today');
  });

  it('useProjectTime should get /tasks/projects/:id/time', async () => {
    const mockData = {
      projectId: 1,
      projectName: 'Test',
      totalDurationSeconds: 3600,
      taskCount: 2,
    };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useProjectTime(1, '2024-01-01', '2024-01-31'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/tasks/projects/1/time?'));
  });

  it('useProjectTasks should get /tasks/projects/:id/tasks', async () => {
    const mockData = [
      {
        id: 1,
        description: 'Test',
        startTime: '',
        endTime: '',
        running: false,
        durationSeconds: 3600,
        projects: [],
        userId: 1,
        username: 'test',
        createdAt: '',
        updatedAt: '',
      },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useProjectTasks(1, '2024-01-01', '2024-01-31'), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/tasks/projects/1/tasks?'));
  });

  it('exportProjectTasks should get blob', async () => {
    const mockBlob = new Blob(['csv'], { type: 'text/csv' });
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockBlob });

    const blob = await exportProjectTasks(1, '2024-01-01', '2024-01-31');
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/tasks/projects/1/export?'),
      { responseType: 'blob' }
    );
  });
});
