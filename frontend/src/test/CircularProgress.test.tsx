import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CircularProgress from '../components/CircularProgress';

describe('CircularProgress', () => {
  it('renders percentage value', () => {
    render(<CircularProgress value={50} label="5h / 10h" sublabel="Week 1 - 7" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders label and sublabel', () => {
    render(<CircularProgress value={25} label="My label" sublabel="My sublabel" />);
    expect(screen.getByText('My label')).toBeInTheDocument();
    expect(screen.getByText('My sublabel')).toBeInTheDocument();
  });

  it('rounds the displayed percentage', () => {
    render(<CircularProgress value={50.7} label="x" sublabel="y" />);
    expect(screen.getByText('51%')).toBeInTheDocument();
  });

  it('renders with low progress value', () => {
    const { container } = render(<CircularProgress value={10} label="a" sublabel="b" />);
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with progress in warning range', () => {
    render(<CircularProgress value={85} label="a" sublabel="b" />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders with progress over 100', () => {
    render(<CircularProgress value={120} label="a" sublabel="b" />);
    expect(screen.getByText('120%')).toBeInTheDocument();
  });

  it('uses custom size', () => {
    const { container } = render(<CircularProgress value={50} label="a" sublabel="b" size={160} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '160');
    expect(svg).toHaveAttribute('height', '160');
  });
});
