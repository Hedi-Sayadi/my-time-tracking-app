import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTasks,
  useActiveTask,
  useStartTask,
  useStopTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useTaskOverview,
} from '../api/tasks';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    })),
  };
});

describe('Task hooks', () => {
  it('useTasks should return query hook', () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    expect(result.current.isLoading).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  it('useActiveTask should return query hook', () => {
    const { result } = renderHook(() => useActiveTask(), { wrapper });
    expect(result.current.isLoading).toBeDefined();
  });

  it('useStartTask should return mutation', () => {
    const { result } = renderHook(() => useStartTask(), { wrapper });
    expect(result.current.mutate).toBeDefined();
  });

  it('useStopTask should return mutation', () => {
    const { result } = renderHook(() => useStopTask(), { wrapper });
    expect(result.current.mutate).toBeDefined();
  });

  it('useCreateTask should return mutation', () => {
    const { result } = renderHook(() => useCreateTask(), { wrapper });
    expect(result.current.mutate).toBeDefined();
  });

  it('useUpdateTask should return mutation', () => {
    const { result } = renderHook(() => useUpdateTask(), { wrapper });
    expect(result.current.mutate).toBeDefined();
  });

  it('useDeleteTask should return mutation', () => {
    const { result } = renderHook(() => useDeleteTask(), { wrapper });
    expect(result.current.mutate).toBeDefined();
  });

  it('useTaskOverview should return query hook', () => {
    const { result } = renderHook(() => useTaskOverview('today'), { wrapper });
    expect(result.current.isLoading).toBeDefined();
  });
});
