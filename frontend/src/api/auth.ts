import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface User {
  id: number;
  username: string;
  email: string;
  timezone: string | null;
  weeklyTargetHours: number | null;
  createdAt: string;
}

export interface WeeklyGoal {
  targetHours: number;
  spentSeconds: number;
  progressPercent: number;
  weekStart: string;
  weekEnd: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface TimezoneRequest {
  timezone: string;
}

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<AuthResponse> => {
      const response = await apiClient.post('/auth/login', data);
      return response.data;
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<AuthResponse> => {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<User> => {
      const response = await apiClient.get('/auth/me');
      return response.data;
    },
    enabled: !!localStorage.getItem('token'),
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      await apiClient.put('/auth/password', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useUpdateTimezone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TimezoneRequest): Promise<User> => {
      const response = await apiClient.put('/auth/timezone', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useWeeklyGoal = () => {
  return useQuery({
    queryKey: ['weekly-goal'],
    queryFn: async (): Promise<WeeklyGoal> => {
      const response = await apiClient.get('/auth/me/goal');
      return response.data;
    },
    enabled: !!localStorage.getItem('token'),
  });
};

export const useUpdateWeeklyGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetHours: number): Promise<User> => {
      const response = await apiClient.put('/auth/me/goal', { targetHours });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-goal'] });
    },
  });
};
