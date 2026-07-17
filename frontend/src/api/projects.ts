import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface Project {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  subprojects: Project[];
  createdAt: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
  parentId?: number | null;
}

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<Project[]> => {
      const response = await apiClient.get('/projects');
      return response.data;
    },
  });
};

export const useProject = (id: number) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async (): Promise<Project> => {
      const response = await apiClient.get(`/projects/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProjectRequest): Promise<Project> => {
      const response = await apiClient.post('/projects', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProjectRequest }): Promise<Project> => {
      const response = await apiClient.put(`/projects/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
