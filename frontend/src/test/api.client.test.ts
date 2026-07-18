import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPost = vi.fn();
const mockGet = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: mockPost,
      get: mockGet,
      put: mockPut,
      delete: mockDelete,
      interceptors: {
        request: {
          use: vi.fn(fn => {
            requestInterceptor = fn;
          }),
        },
        response: {
          use: vi.fn((success, error) => {
            responseSuccess = success;
            responseError = error;
          }),
        },
      },
    })),
  },
}));

let requestInterceptor: any;
let responseSuccess: any;
let responseError: any;

describe('API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Re-import to trigger the module
    vi.resetModules();
  });

  it('request interceptor should add Bearer token when present', async () => {
    localStorage.setItem('token', 'my-token');
    await import('../api/client');

    const config = { headers: {} };
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBe('Bearer my-token');
  });

  it('request interceptor should not add header when no token', async () => {
    await import('../api/client');

    const config = { headers: {} };
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('response success interceptor should pass through', async () => {
    await import('../api/client');

    const response = { data: 'ok' };
    const result = responseSuccess(response);
    expect(result).toEqual(response);
  });

  it('response error interceptor should clear token on 401', async () => {
    localStorage.setItem('token', 'old-token');
    await import('../api/client');

    const error = { response: { status: 401 } };
    await expect(responseError(error)).rejects.toEqual(error);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('response error interceptor should pass through other errors', async () => {
    await import('../api/client');

    const error = { response: { status: 500 } };
    await expect(responseError(error)).rejects.toEqual(error);
  });
});
