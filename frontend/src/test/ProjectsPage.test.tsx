import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ProjectsPage from '../pages/ProjectsPage';
import * as projectsApi from '../api/projects';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </BrowserRouter>
);

const useQueryMock = (data: any, isLoading = false) => ({
  data,
  isLoading,
  isPending: isLoading,
  isError: false,
  error: null,
  isSuccess: !isLoading,
  status: isLoading ? 'pending' : 'success',
  fetchStatus: isLoading ? 'fetching' : 'idle',
  isFetching: isLoading,
  isInitialLoading: isLoading,
  refetch: vi.fn(),
  promise: Promise.resolve(null),
});

const mutationMock = (overrides: Partial<any> = {}) => ({
  mutateAsync: vi.fn().mockResolvedValue({}),
  mutate: vi.fn(),
  isPending: false,
  isIdle: true,
  isSuccess: false,
  isError: false,
  error: null,
  status: 'idle',
  reset: vi.fn(),
  ...overrides,
});

const projects = [
  {
    id: 1,
    name: 'Project Alpha',
    description: 'desc',
    parentId: null,
    subprojects: [],
    ownerId: 1,
    ownerUsername: 'tester',
    members: [],
    budgetHours: 10,
    spentSeconds: 3600,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Project Beta',
    description: '',
    parentId: null,
    subprojects: [],
    ownerId: 1,
    ownerUsername: 'tester',
    members: [],
    budgetHours: null,
    spentSeconds: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.spyOn(projectsApi, 'useProjects').mockReturnValue(useQueryMock(projects) as any);
    vi.spyOn(projectsApi, 'useCreateProject').mockReturnValue(mutationMock() as any);
    vi.spyOn(projectsApi, 'useUpdateProject').mockReturnValue(mutationMock() as any);
    vi.spyOn(projectsApi, 'useDeleteProject').mockReturnValue(mutationMock() as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the page header', () => {
    render(<ProjectsPage />, { wrapper });

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /keep your lectures/i })).toBeInTheDocument();
  });

  it('renders the create button', () => {
    render(<ProjectsPage />, { wrapper });

    expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument();
  });

  it('renders the project list with project names', () => {
    render(<ProjectsPage />, { wrapper });

    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /project overview/i })).toBeInTheDocument();
  });

  it('renders view and edit buttons for each project', () => {
    render(<ProjectsPage />, { wrapper });

    const viewButtons = screen.getAllByRole('button', { name: /^view$/i });
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i });
    expect(viewButtons).toHaveLength(2);
    expect(editButtons).toHaveLength(2);
  });

  it('shows the create form when New project is clicked', () => {
    render(<ProjectsPage />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /new project/i }));

    expect(screen.getByRole('heading', { name: /new project/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('shows the edit form when Edit is clicked', () => {
    render(<ProjectsPage />, { wrapper });

    fireEvent.click(screen.getAllByRole('button', { name: /^edit$/i })[0]);

    expect(screen.getByRole('heading', { name: /edit project/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.spyOn(projectsApi, 'useProjects').mockReturnValue(useQueryMock(null, true) as any);
    render(<ProjectsPage />, { wrapper });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty state when no projects', () => {
    vi.spyOn(projectsApi, 'useProjects').mockReturnValue(useQueryMock([]) as any);
    render(<ProjectsPage />, { wrapper });

    expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
  });

  it('submits the create form with valid data', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.spyOn(projectsApi, 'useCreateProject').mockReturnValue({
      ...mutationMock(),
      mutateAsync,
    } as any);

    render(<ProjectsPage />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /new project/i }));
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: 'New Project' } });

    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
    });
  });

  it('should cancel form when cancel clicked', () => {
    render(<ProjectsPage />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /new project/i }));
    expect(screen.getByRole('heading', { name: /new project/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('heading', { name: /new project/i })).not.toBeInTheDocument();
  });

  it('should delete project when delete clicked', () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    );
    const mutate = vi.fn();
    vi.spyOn(projectsApi, 'useDeleteProject').mockReturnValue({ ...mutationMock(), mutate } as any);

    render(<ProjectsPage />, { wrapper });

    const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
    fireEvent.click(deleteButtons[0]);

    expect(mutate).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('should render budget bar for project with budget', () => {
    render(<ProjectsPage />, { wrapper });

    expect(screen.getByText(/1\.0h \/ 10h/i)).toBeInTheDocument();
  });

  it('should render warning budget bar', () => {
    const warningProjects = [
      {
        id: 1,
        name: 'Warning Proj',
        description: '',
        parentId: null,
        subprojects: [],
        ownerId: 1,
        ownerUsername: 'tester',
        members: [],
        budgetHours: 10,
        spentSeconds: 28800,
        createdAt: '',
      },
    ];
    vi.spyOn(projectsApi, 'useProjects').mockReturnValue(useQueryMock(warningProjects) as any);
    render(<ProjectsPage />, { wrapper });

    expect(screen.getByText(/8\.0h \/ 10h/i)).toBeInTheDocument();
    expect(screen.getByText(/approaching limit/i)).toBeInTheDocument();
  });

  it('should render over budget bar', () => {
    const overProjects = [
      {
        id: 1,
        name: 'Over Proj',
        description: '',
        parentId: null,
        subprojects: [],
        ownerId: 1,
        ownerUsername: 'tester',
        members: [],
        budgetHours: 10,
        spentSeconds: 40000,
        createdAt: '',
      },
    ];
    vi.spyOn(projectsApi, 'useProjects').mockReturnValue(useQueryMock(overProjects) as any);
    render(<ProjectsPage />, { wrapper });

    expect(screen.getByText(/11\.1h \/ 10h/i)).toBeInTheDocument();
    expect(screen.getByText(/over budget/i)).toBeInTheDocument();
  });

  it('should submit edit form', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.spyOn(projectsApi, 'useUpdateProject').mockReturnValue({
      ...mutationMock(),
      mutateAsync,
    } as any);

    render(<ProjectsPage />, { wrapper });

    fireEvent.click(screen.getAllByRole('button', { name: /^edit$/i })[0]);
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: 'Updated Alpha' } });

    fireEvent.click(screen.getByRole('button', { name: /update/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
    });
  });
});
