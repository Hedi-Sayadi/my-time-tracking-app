import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface ProjectMember {
  id: number;
  userId: number;
  username: string;
  joinedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  subprojects: Project[];
  ownerId: number;
  ownerUsername: string;
  members: ProjectMember[];
  budgetHours: number | null;
  spentSeconds: number | null;
  createdAt: string;
}

export interface ProjectBudget {
  projectId: number;
  projectName: string;
  budgetHours: number | null;
  spentSeconds: number;
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

export const useShareProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, username }: { id: number; username: string }): Promise<ProjectMember> => {
      const response = await apiClient.post(`/projects/${id}/share`, { username });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['projects', id, 'members'] });
    },
  });
};

export const useUnshareProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: number; userId: number }) => {
      await apiClient.delete(`/projects/${id}/share/${userId}`);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['projects', id, 'members'] });
    },
  });
};

export const useProjectMembers = (id: number) => {
  return useQuery({
    queryKey: ['projects', id, 'members'],
    queryFn: async (): Promise<ProjectMember[]> => {
      const response = await apiClient.get(`/projects/${id}/members`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useProjectBudget = (id: number) => {
  return useQuery({
    queryKey: ['projects', id, 'budget'],
    queryFn: async (): Promise<ProjectBudget> => {
      const response = await apiClient.get(`/projects/${id}/budget`);
      return response.data;
    },
    enabled: !!id,
  });
};

export interface MemberContribution {
  userId: number;
  username: string;
  totalDurationSeconds: number;
  taskCount: number;
  joinedAt: string;
}

export const useProjectTeam = (id: number) => {
  return useQuery({
    queryKey: ['projects', id, 'team'],
    queryFn: async (): Promise<MemberContribution[]> => {
      const response = await apiClient.get(`/projects/${id}/team`);
      return response.data;
    },
    enabled: !!id,
  });
};
