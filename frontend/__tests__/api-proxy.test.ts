import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST, PUT, DELETE } from '../src/app/api/[[...proxy]]/route';
import { NextRequest } from 'next/server';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Proxy Route', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET method', () => {
    it('proxies GET requests to backend', async () => {
      const mockResponse = { success: true, data: { tasks: [] } };
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
        status: 200,
        ok: true,
      });

      const request = {
        url: 'http://localhost:3000/api/1/tasks',
        method: 'GET',
        headers: {
          get: (name: string) => name === 'authorization' ? 'Bearer test-token' : null,
        },
      } as unknown as NextRequest;

      const result = await GET(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/1/tasks',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: 'Bearer test-token'
          },
        }
      );
      expect(result.status).toBe(200);
    });

    it('returns 404 for unsupported paths', async () => {
      const request = {
        url: 'http://localhost:3000/api/unsupported',
        method: 'GET',
        headers: {
          get: () => null,
        },
      } as unknown as NextRequest;

      const result = await GET(request);

      expect(result.status).toBe(404);
    });
  });

  describe('POST method', () => {
    it('proxies POST requests to backend', async () => {
      const mockResponse = { success: true, data: { task: { id: 1, title: 'New Task' } } };
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
        status: 200,
        ok: true,
      });

      // Mock request with JSON body
      const request = {
        url: 'http://localhost:3000/api/1/tasks',
        method: 'POST',
        headers: {
          get: (name: string) => name === 'authorization' ? 'Bearer test-token' : null,
        },
        json: () => Promise.resolve({ title: 'New Task' }),
      } as unknown as NextRequest;

      const result = await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/1/tasks',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: 'Bearer test-token'
          },
          body: JSON.stringify({ title: 'New Task' }),
        }
      );
      expect(result.status).toBe(200);
    });
  });

  describe('PUT method', () => {
    it('proxies PUT requests to backend', async () => {
      const mockResponse = { success: true, data: { task: { id: 1, title: 'Updated Task', completed: true } } };
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
        status: 200,
        ok: true,
      });

      const request = {
        url: 'http://localhost:3000/api/1/tasks/1',
        method: 'PUT',
        headers: {
          get: (name: string) => name === 'authorization' ? 'Bearer test-token' : null,
        },
        json: () => Promise.resolve({ completed: true }),
      } as unknown as NextRequest;

      const result = await PUT(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/1/tasks/1',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            authorization: 'Bearer test-token'
          },
          body: JSON.stringify({ completed: true }),
        }
      );
      expect(result.status).toBe(200);
    });
  });

  describe('DELETE method', () => {
    it('proxies DELETE requests to backend', async () => {
      const mockResponse = { success: true, data: { message: 'Task deleted' } };
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
        status: 200,
        ok: true,
      });

      const request = {
        url: 'http://localhost:3000/api/1/tasks/1',
        method: 'DELETE',
        headers: {
          get: (name: string) => name === 'authorization' ? 'Bearer test-token' : null,
        },
      } as unknown as NextRequest;

      const result = await DELETE(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/1/tasks/1',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            authorization: 'Bearer test-token'
          },
        }
      );
      expect(result.status).toBe(200);
    });
  });
});