import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { taskService } from '../src/app/api/tasks';
import { Task, TaskCreate, TaskUpdate } from '../../shared/types/task';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the auth utility
vi.mock('../src/lib/auth', () => ({
  getAuthHeaders: () => ({ authorization: 'Bearer test-token' }),
}));

describe('taskService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getTasks', () => {
    it('fetches tasks for a user', async () => {
      const mockTasks = [
        { id: 1, title: 'Test Task', completed: false, user_id: 1, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
      ];
      const mockResponse = {
        success: true,
        data: { tasks: mockTasks, total: 1 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await taskService.getTasks(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/1/tasks', {
        method: 'GET',
        headers: { authorization: 'Bearer test-token' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('fetches all tasks without user ID', async () => {
      const mockTasks = [
        { id: 1, title: 'Test Task', completed: false, user_id: 1, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
      ];
      const mockResponse = {
        success: true,
        data: { tasks: mockTasks, total: 1 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await taskService.getTasks();

      expect(mockFetch).toHaveBeenCalledWith('/api/tasks', {
        method: 'GET',
        headers: { authorization: 'Bearer test-token' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('throws an error when request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Failed to fetch' } }),
      });

      await expect(taskService.getTasks(1)).rejects.toThrow('Failed to fetch');
    });
  });

  describe('createTask', () => {
    it('creates a new task for a user', async () => {
      const taskData: TaskCreate = { title: 'New Task', description: 'Description' };
      const mockResponse = {
        success: true,
        data: {
          task: { id: 1, title: 'New Task', description: 'Description', completed: false, user_id: 1, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await taskService.createTask(taskData, 1);

      expect(mockFetch).toHaveBeenCalledWith('/api/1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer test-token'
        },
        body: JSON.stringify(taskData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('throws an error when task creation fails', async () => {
      const taskData: TaskCreate = { title: 'New Task' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Failed to create task' } }),
      });

      await expect(taskService.createTask(taskData, 1)).rejects.toThrow('Failed to create task');
    });
  });

  describe('updateTask', () => {
    it('updates an existing task', async () => {
      const taskUpdate: TaskUpdate = { title: 'Updated Task', completed: true };
      const mockResponse = {
        success: true,
        data: {
          task: { id: 1, title: 'Updated Task', completed: true, user_id: 1, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-02T00:00:00Z' },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await taskService.updateTask(1, taskUpdate, 1);

      expect(mockFetch).toHaveBeenCalledWith('/api/1/tasks/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer test-token'
        },
        body: JSON.stringify(taskUpdate),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteTask', () => {
    it('deletes a task', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Task deleted successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await taskService.deleteTask(1, 1);

      expect(mockFetch).toHaveBeenCalledWith('/api/1/tasks/1', {
        method: 'DELETE',
        headers: { authorization: 'Bearer test-token' },
      });
      expect(result).toEqual(mockResponse);
    });
  });
});