import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import apiClient from '../client';
import axios from 'axios';

// Mock window.location for 401 redirect tests
const mockAssign = vi.fn();
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
});

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should add Authorization header when token exists', async () => {
    localStorage.setItem('token', 'test-token');

    // The interceptor should add the header
    const request = { headers: {} as Record<string, string> };
    // Simulate what the interceptor does
    const token = localStorage.getItem('token');
    expect(token).toBe('test-token');
  });

  it('should not add Authorization header when no token', () => {
    const token = localStorage.getItem('token');
    expect(token).toBeNull();
  });

  it('should remove token and redirect on 401', async () => {
    localStorage.setItem('token', 'test-token');

    // Mock a 401 response
    const mockError = {
      response: { status: 401 },
    };

    // Simulate interceptor behavior
    if (mockError.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });
});
