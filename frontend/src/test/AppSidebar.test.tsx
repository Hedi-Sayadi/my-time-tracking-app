import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppSidebar from '../components/AppSidebar';

function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('AppSidebar', () => {
  it('renders the brand mark and name', () => {
    renderWithRouter(<AppSidebar />);

    expect(screen.getByText('TT')).toBeInTheDocument();
    expect(screen.getByText('TimeTrack')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    renderWithRouter(<AppSidebar />);

    expect(screen.getByRole('link', { name: /^dashboard$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^projects$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^tasks$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^reports$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^settings$/i })).toBeInTheDocument();
  });

  it('renders the navigation aria-label', () => {
    renderWithRouter(<AppSidebar />);

    expect(screen.getByRole('complementary', { name: /navigation/i })).toBeInTheDocument();
  });
});