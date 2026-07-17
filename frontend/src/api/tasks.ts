import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface Task {
  id: number;
  description: string;
  startTime: string;
  endTime: string | null;
  running: boolean;
  durationSeconds: number;
  projects: { id: number; name: string }[];
  userId: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRef {
  id: number;
  name: string;
}

export interface TaskRequest {
  description: string;
  startTime: string;
  endTime?: string | null;
  projectIds?: number[];
}

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      const response = await apiClient.get('/tasks');
      return response.data;
    },
  });
};

export const useActiveTask = () => {
  return useQuery({
    queryKey: ['tasks', 'active'],
    queryFn: async (): Promise<Task | null> => {
      const response = await apiClient.get('/tasks/active');
      return response.status === 204 ? null : response.data;
    },
    refetchInterval: 30000, // refetch every 30s to sync across tabs
  });
};

export const useStartTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<TaskRequest>): Promise<Task> => {
      const response = await apiClient.post('/tasks/start', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'active'] });
    },
  });
};

export const useStopTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<Task> => {
      const response = await apiClient.post(`/tasks/${id}/stop`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'active'] });
    },
  });
};

export const useResumeTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<Task> => {
      const response = await apiClient.post(`/tasks/${id}/resume`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'active'] });
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TaskRequest): Promise<Task> => {
      const response = await apiClient.post('/tasks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'active'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TaskRequest }): Promise<Task> => {
      const response = await apiClient.put(`/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'active'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'active'] });
    },
  });
};

export interface TaskOverview {
  period: string;
  totalDurationSeconds: number;
  tasks: Task[];
  from: string;
  to: string;
}

export const useTaskOverview = (period: string) => {
  return useQuery({
    queryKey: ['tasks', 'overview', period],
    queryFn: async (): Promise<TaskOverview> => {
      const response = await apiClient.get(`/tasks/overview?period=${period}`);
      return response.data;
    },
  });
};

export interface ProjectTime {
  projectId: number;
  projectName: string;
  totalDurationSeconds: number;
  taskCount: number;
}

export const useProjectTime = (projectId: number, from: string, to: string, userId?: number | null) => {
  return useQuery({
    queryKey: ['projects', projectId, 'time', from, to, userId],
    queryFn: async (): Promise<ProjectTime> => {
      const params = new URLSearchParams();
      params.append('from', from);
      params.append('to', to);
      if (userId != null) params.append('userId', String(userId));
      const response = await apiClient.get(`/tasks/projects/${projectId}/time?${params.toString()}`);
      return response.data;
    },
    enabled: !!projectId && !!from && !!to,
  });
};

export const useProjectTasks = (projectId: number, from: string, to: string, userId?: number | null) => {
  return useQuery({
    queryKey: ['projects', projectId, 'tasks', from, to, userId],
    queryFn: async (): Promise<Task[]> => {
      const params = new URLSearchParams();
      params.append('from', from);
      params.append('to', to);
      if (userId != null) params.append('userId', String(userId));
      const response = await apiClient.get(`/tasks/projects/${projectId}/tasks?${params.toString()}`);
      return response.data;
    },
    enabled: !!projectId && !!from && !!to,
  });
};

export const exportProjectTasks = async (projectId: number, from: string, to: string): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('from', from);
  params.append('to', to);
  const response = await apiClient.get(`/tasks/projects/${projectId}/export?${params.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
};
