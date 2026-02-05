// API service for tasks
import { Task, TaskCreate, TaskUpdate, TasksResponse, TaskResponse } from '../../../../shared/types/task';
import { getAuthHeaders } from '../../lib/auth';

export const taskService = {
  async getTasks(userId?: number | string): Promise<TasksResponse> {
    const headers = getAuthHeaders();

    const apiUrl = userId ? `/api/${userId}/tasks` : '/api/tasks';
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to fetch tasks');
    }
  },

  async getTaskById(taskId: number, userId?: number | string): Promise<TaskResponse> {
    const headers = getAuthHeaders();

    const apiUrl = userId ? `/api/${userId}/tasks/${taskId}` : `/api/tasks/${taskId}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to fetch task');
    }
  },

  async createTask(taskData: TaskCreate, userId?: number | string): Promise<TaskResponse> {
    const headers = getAuthHeaders();
    headers['Content-Type'] = 'application/json';

    const apiUrl = userId ? `/api/${userId}/tasks` : '/api/tasks';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(taskData),
    });

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to create task');
    }
  },

  async updateTask(taskId: number, taskData: TaskUpdate, userId?: number | string): Promise<TaskResponse> {
    const headers = getAuthHeaders();
    headers['Content-Type'] = 'application/json';

    const apiUrl = userId ? `/api/${userId}/tasks/${taskId}` : `/api/tasks/${taskId}`;
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(taskData),
    });

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to update task');
    }
  },

  async deleteTask(taskId: number, userId?: number | string): Promise<{ success: boolean; data: { message: string } }> {
    const headers = getAuthHeaders();

    const apiUrl = userId ? `/api/${userId}/tasks/${taskId}` : `/api/tasks/${taskId}`;
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers,
    });

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to delete task');
    }
  }
};