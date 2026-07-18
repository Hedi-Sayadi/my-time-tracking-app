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
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useShareProject,
  useUnshareProject,
  useProjectMembers,
  useProjectBudget,
  useProjectTeam,
} from '../api/projects';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Projects API hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('useProjects should get /projects', async () => {
    const mockData = [
      {
        id: 1,
        name: 'Test',
        description: '',
        parentId: null,
        subprojects: [],
        ownerId: 1,
        ownerUsername: 'test',
        members: [],
        budgetHours: null,
        spentSeconds: null,
        createdAt: '',
      },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(apiClient.get).toHaveBeenCalledWith('/projects');
  });

  it('useProject should get /projects/:id', async () => {
    const mockData = {
      id: 1,
      name: 'Test',
      description: '',
      parentId: null,
      subprojects: [],
      ownerId: 1,
      ownerUsername: 'test',
      members: [],
      budgetHours: null,
      spentSeconds: null,
      createdAt: '',
    };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useProject(1), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith('/projects/1');
  });

  it('useCreateProject should post to /projects', async () => {
    const mockData = {
      id: 1,
      name: 'New',
      description: '',
      parentId: null,
      subprojects: [],
      ownerId: 1,
      ownerUsername: 'test',
      members: [],
      budgetHours: null,
      spentSeconds: null,
      createdAt: '',
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useCreateProject(), { wrapper });
    const data = await result.current.mutateAsync({ name: 'New', description: '', parentId: null });
    expect(data).toEqual(mockData);
    expect(apiClient.post).toHaveBeenCalledWith('/projects', {
      name: 'New',
      description: '',
      parentId: null,
    });
  });

  it('useUpdateProject should put to /projects/:id', async () => {
    const mockData = {
      id: 1,
      name: 'Updated',
      description: '',
      parentId: null,
      subprojects: [],
      ownerId: 1,
      ownerUsername: 'test',
      members: [],
      budgetHours: null,
      spentSeconds: null,
      createdAt: '',
    };
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useUpdateProject(), { wrapper });
    const data = await result.current.mutateAsync({
      id: 1,
      data: { name: 'Updated', description: '' },
    });
    expect(data).toEqual(mockData);
    expect(apiClient.put).toHaveBeenCalledWith('/projects/1', { name: 'Updated', description: '' });
  });

  it('useDeleteProject should delete /projects/:id', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteProject(), { wrapper });
    await result.current.mutateAsync(1);
    expect(apiClient.delete).toHaveBeenCalledWith('/projects/1');
  });

  it('useShareProject should post to /projects/:id/share', async () => {
    const mockData = { id: 1, userId: 2, username: 'friend', joinedAt: '' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useShareProject(), { wrapper });
    const data = await result.current.mutateAsync({ id: 1, username: 'friend' });
    expect(data).toEqual(mockData);
    expect(apiClient.post).toHaveBeenCalledWith('/projects/1/share', { username: 'friend' });
  });

  it('useUnshareProject should delete /projects/:id/share/:userId', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({});

    const { result } = renderHook(() => useUnshareProject(), { wrapper });
    await result.current.mutateAsync({ id: 1, userId: 2 });
    expect(apiClient.delete).toHaveBeenCalledWith('/projects/1/share/2');
  });

  it('useProjectMembers should get /projects/:id/members', async () => {
    const mockData = [{ id: 1, userId: 2, username: 'friend', joinedAt: '' }];
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useProjectMembers(1), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith('/projects/1/members');
  });

  it('useProjectBudget should get /projects/:id/budget', async () => {
    const mockData = { projectId: 1, projectName: 'Test', budgetHours: 10, spentSeconds: 3600 };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useProjectBudget(1), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith('/projects/1/budget');
  });

  it('useProjectTeam should get /projects/:id/team', async () => {
    const mockData = [
      { userId: 1, username: 'test', totalDurationSeconds: 3600, taskCount: 2, joinedAt: '' },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useProjectTeam(1), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith('/projects/1/team');
  });
});
