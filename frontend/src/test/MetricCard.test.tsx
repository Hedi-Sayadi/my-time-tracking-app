import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricCard from '../components/MetricCard';

describe('MetricCard', () => {
  it('renders the label', () => {
    render(<MetricCard label="Tracked today" value="3h 0m" note="2 tasks logged today" />);
    expect(screen.getByText('Tracked today')).toBeInTheDocument();
  });

  it('renders the value', () => {
    render(<MetricCard label="Tracked today" value="3h 0m" note="2 tasks logged today" />);
    expect(screen.getByText('3h 0m')).toBeInTheDocument();
  });

  it('renders the note', () => {
    render(<MetricCard label="Projects" value="4" note="Accessible projects" />);
    expect(screen.getByText('Accessible projects')).toBeInTheDocument();
  });

  it('renders all props together', () => {
    render(<MetricCard label="Running timer" value="1" note="One task is active" />);
    expect(screen.getByText('Running timer')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('One task is active')).toBeInTheDocument();
  });
});
