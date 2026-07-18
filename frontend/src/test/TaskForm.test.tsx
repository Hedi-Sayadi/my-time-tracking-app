import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TaskForm from '../components/TaskForm';
import { ReactNode } from 'react';
import * as tasksApi from '../api/tasks';
import * as projectsApi from '../api/projects';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('TaskForm', () => {
  it('should render create form with empty fields', () => {
    render(<TaskForm />, { wrapper });

    expect(screen.getByLabelText(/description/i)).toHaveValue('');
    expect(screen.getByLabelText(/start time/i)).toHaveValue('');
    expect(screen.getByLabelText(/end time/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('should render edit form with initial data', () => {
    const initialData = {
      id: 1,
      description: 'Test task',
      startTime: '2024-01-01T10:00:00Z',
      endTime: '2024-01-01T12:00:00Z',
    };

    render(<TaskForm initialData={initialData} />, { wrapper });

    expect(screen.getByLabelText(/description/i)).toHaveValue('Test task');
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
  });

  it('should show validation error when description is empty', async () => {
    render(<TaskForm />, { wrapper });

    const submitButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(submitButton);

    // HTML5 validation prevents submission without values
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
    expect(descriptionInput.validity.valid).toBe(false);
    expect(descriptionInput.validity.valueMissing).toBe(true);
  });

  it('should call onSuccess after successful submission', async () => {
    const onSuccess = vi.fn();
    const mutateAsync = vi.fn().mockResolvedValue({});

    vi.spyOn(tasksApi, 'useCreateTask').mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
      isIdle: false,
      isSuccess: false,
      status: 'idle',
      variables: undefined,
      data: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      mutate: vi.fn(),
      reset: vi.fn(),
      context: undefined,
      submittedAt: 0,
    } as any);

    render(<TaskForm onSuccess={onSuccess} />, { wrapper });

    await userEvent.type(screen.getByLabelText(/description/i), 'New task');
    await userEvent.type(screen.getByLabelText(/start time/i), '2024-01-01T10:00');

    fireEvent.click(screen.getByRole('button', { name: /add task/i }));

    expect(mutateAsync).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn();
    render(<TaskForm onCancel={onCancel} />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('should submit in edit mode', async () => {
    const onSuccess = vi.fn();
    const mutateAsync = vi.fn().mockResolvedValue({});

    vi.spyOn(tasksApi, 'useUpdateTask').mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
      isIdle: false,
      isSuccess: false,
      status: 'idle',
      variables: undefined,
      data: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      mutate: vi.fn(),
      reset: vi.fn(),
      context: undefined,
      submittedAt: 0,
    } as any);

    const initialData = {
      id: 1,
      description: 'Old',
      startTime: '2024-01-01T10:00:00Z',
      projects: [{ id: 1, name: 'P1' }],
    };

    render(<TaskForm initialData={initialData} onSuccess={onSuccess} />, { wrapper });

    await userEvent.clear(screen.getByLabelText(/description/i));
    await userEvent.type(screen.getByLabelText(/description/i), 'Updated');

    fireEvent.click(screen.getByRole('button', { name: /update task/i }));
    expect(mutateAsync).toHaveBeenCalled();
  });

  it('should show error when create fails', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({ response: { data: { detail: 'Server error' } } });

    vi.spyOn(tasksApi, 'useCreateTask').mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
      isIdle: false,
      isSuccess: false,
      status: 'idle',
      variables: undefined,
      data: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      mutate: vi.fn(),
      reset: vi.fn(),
      context: undefined,
      submittedAt: 0,
    } as any);

    vi.spyOn(tasksApi, 'useUpdateTask').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      isIdle: false,
      isSuccess: false,
      status: 'idle',
      variables: undefined,
      data: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      mutate: vi.fn(),
      reset: vi.fn(),
      context: undefined,
      submittedAt: 0,
    } as any);

    render(<TaskForm />, { wrapper });

    await userEvent.type(screen.getByLabelText(/description/i), 'Task');
    await userEvent.type(screen.getByLabelText(/start time/i), '2024-01-01T10:00');

    fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('should toggle project checkbox', async () => {
    const mockProjects = [{ id: 1, name: 'P1', description: '', parentId: null, subprojects: [], ownerId: 1, ownerUsername: 'test', members: [], budgetHours: null, spentSeconds: null, createdAt: '' }];
    vi.spyOn(projectsApi, 'useProjects').mockReturnValue({
      data: mockProjects, isLoading: false, isPending: false, isError: false, error: null,
      isSuccess: true, status: 'success', fetchStatus: 'idle', isFetching: false,
      isInitialLoading: false, refetch: vi.fn(), promise: Promise.resolve(mockProjects),
    } as any);

    render(<TaskForm />, { wrapper });

    const checkbox = screen.getByLabelText(/p1/i);
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
