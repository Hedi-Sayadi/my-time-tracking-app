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
  useLogin,
  useRegister,
  useCurrentUser,
  useChangePassword,
  useUpdateTimezone,
  useWeeklyGoal,
  useUpdateWeeklyGoal,
} from '../api/auth';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Auth API hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    queryClient.clear();
  });

  it('useLogin should post to /auth/login', async () => {
    const mockResponse = {
      token: 'abc',
      type: 'Bearer',
      user: {
        id: 1,
        username: 'test',
        email: 't@t.com',
        timezone: null,
        weeklyTargetHours: null,
        createdAt: '2024-01-01',
      },
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(() => useLogin(), { wrapper });
    const data = await result.current.mutateAsync({ username: 'test', password: 'pass' });

    expect(data).toEqual(mockResponse);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      username: 'test',
      password: 'pass',
    });
  });

  it('useRegister should post to /auth/register', async () => {
    const mockResponse = {
      token: 'abc',
      type: 'Bearer',
      user: {
        id: 1,
        username: 'test',
        email: 't@t.com',
        timezone: null,
        weeklyTargetHours: null,
        createdAt: '2024-01-01',
      },
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(() => useRegister(), { wrapper });
    const data = await result.current.mutateAsync({
      username: 'test',
      email: 't@t.com',
      password: 'pass',
    });

    expect(data).toEqual(mockResponse);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      username: 'test',
      email: 't@t.com',
      password: 'pass',
    });
  });

  it('useCurrentUser should get /auth/me when token exists', async () => {
    const mockUser = {
      id: 1,
      username: 'test',
      email: 't@t.com',
      timezone: null,
      weeklyTargetHours: null,
      createdAt: '2024-01-01',
    };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockUser });
    localStorage.setItem('token', 'test-token');

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUser);
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
  });

  it('useCurrentUser should not fetch when no token', () => {
    const { result } = renderHook(() => useCurrentUser(), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('useChangePassword should put to /auth/password', async () => {
    vi.mocked(apiClient.put).mockResolvedValueOnce({});

    const { result } = renderHook(() => useChangePassword(), { wrapper });
    await result.current.mutateAsync({ oldPassword: 'old', newPassword: 'new' });

    expect(apiClient.put).toHaveBeenCalledWith('/auth/password', {
      oldPassword: 'old',
      newPassword: 'new',
    });
  });

  it('useUpdateTimezone should put to /auth/timezone', async () => {
    const mockUser = {
      id: 1,
      username: 'test',
      email: 't@t.com',
      timezone: 'Europe/Berlin',
      weeklyTargetHours: null,
      createdAt: '2024-01-01',
    };
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockUser });

    const { result } = renderHook(() => useUpdateTimezone(), { wrapper });
    const data = await result.current.mutateAsync({ timezone: 'Europe/Berlin' });

    expect(data).toEqual(mockUser);
    expect(apiClient.put).toHaveBeenCalledWith('/auth/timezone', { timezone: 'Europe/Berlin' });
  });

  it('useWeeklyGoal should get /auth/me/goal when token exists', async () => {
    const mockGoal = {
      targetHours: 40,
      spentSeconds: 3600,
      progressPercent: 2.5,
      weekStart: '2024-01-01',
      weekEnd: '2024-01-07',
    };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockGoal });
    localStorage.setItem('token', 'test-token');

    const { result } = renderHook(() => useWeeklyGoal(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockGoal);
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me/goal');
  });

  it('useUpdateWeeklyGoal should put to /auth/me/goal', async () => {
    const mockUser = {
      id: 1,
      username: 'test',
      email: 't@t.com',
      timezone: null,
      weeklyTargetHours: 40,
      createdAt: '2024-01-01',
    };
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockUser });

    const { result } = renderHook(() => useUpdateWeeklyGoal(), { wrapper });
    const data = await result.current.mutateAsync(40);

    expect(data).toEqual(mockUser);
    expect(apiClient.put).toHaveBeenCalledWith('/auth/me/goal', { targetHours: 40 });
  });
});
