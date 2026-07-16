import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin, useRegister, useCurrentUser, useChangePassword } from '../api/auth';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// Mock axios
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

describe('useLogin', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('should return mutation function', () => {
    const { result } = renderHook(() => useLogin(), { wrapper });
    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });
});

describe('useRegister', () => {
  it('should return mutation function', () => {
    const { result } = renderHook(() => useRegister(), { wrapper });
    expect(result.current.mutate).toBeDefined();
  });
});

describe('useCurrentUser', () => {
  beforeEach(() => {
    localStorage.clear();
    queryClient.clear();
  });

  it('should be disabled when no token', () => {
    const { result } = renderHook(() => useCurrentUser(), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });
});

describe('useChangePassword', () => {
  it('should return mutation function', () => {
    const { result } = renderHook(() => useChangePassword(), { wrapper });
    expect(result.current.mutate).toBeDefined();
  });
});
