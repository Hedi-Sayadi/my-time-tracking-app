import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TimerCard from '../components/TimerCard';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

vi.mock('../api/tasks', () => ({
  useActiveTask: vi.fn(),
  useStartTask: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useStopTask: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

describe('TimerCard', () => {
  it('should show no active task state when idle', () => {
    const { useActiveTask } = require('../api/tasks');
    useActiveTask.mockReturnValue({ data: null, isLoading: false });

    render(<TimerCard />, { wrapper });
    
    expect(screen.getByText('No active task')).toBeInTheDocument();
    expect(screen.getByText('Ready to start tracking')).toBeInTheDocument();
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('should show start button when no task is running', () => {
    const { useActiveTask } = require('../api/tasks');
    useActiveTask.mockReturnValue({ data: null, isLoading: false });

    render(<TimerCard />, { wrapper });
    
    expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
  });

  it('should show loading state', () => {
    const { useActiveTask } = require('../api/tasks');
    useActiveTask.mockReturnValue({ data: null, isLoading: true });

    render(<TimerCard />, { wrapper });
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
