'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaskCreate } from '../../../shared/types/task';
import { getAuthHeaders } from '../lib/auth';

interface TaskFormProps {
  initialData?: Partial<TaskCreate>;
  taskId?: number;
  isEditing?: boolean;
  userId?: number | string; // Add userId prop for API calls
}

export default function TaskForm({ initialData = {}, taskId, isEditing = false, userId }: TaskFormProps) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);

    try {
      const headers = getAuthHeaders();
      headers['Content-Type'] = 'application/json';

      const taskData: TaskCreate = {
        title: title.trim(),
        description: description.trim() || undefined
      };

      // For edit mode, we can try to get user ID from the task itself if not provided
      // For create mode, user ID is required
      if (!isEditing && !userId) {
        throw new Error('User ID is required for creating a new task');
      }

      let effectiveUserId = userId;
      if (isEditing && taskId && !userId) {
        // If we're editing but no userId was provided, we need to get the task first to determine user
        // This would require a fetch to get the task, but it's better to pass userId in props
        throw new Error('User ID is required for updating a task');
      }

      let response;
      if (isEditing && taskId) {
        // Update existing task
        response = await fetch(`/api/${effectiveUserId}/tasks/${taskId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(taskData),
        });
      } else {
        // Create new task
        response = await fetch(`/api/${effectiveUserId}/tasks`, {
          method: 'POST',
          headers,
          body: JSON.stringify(taskData),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || (isEditing ? 'Failed to update task' : 'Failed to create task'));
      }

      // Redirect to tasks list after successful operation
      router.push('/tasks');
      router.refresh(); // Refresh the page to update the task list
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter task title"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter task description (optional)"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <a
            href="/tasks"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Task' : 'Create Task')}
          </button>
        </div>
      </form>
    </div>
  );
}