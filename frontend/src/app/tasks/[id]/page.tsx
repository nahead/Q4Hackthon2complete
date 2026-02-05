'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Task } from '../../../../../shared/types/task';
import { getAuthHeaders } from '../../../lib/auth';
import { useAuth } from '../../../contexts/AuthContext';

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTask();
    } else {
      setError('You must be logged in to view task details');
      setLoading(false);
    }
  }, [id, isAuthenticated, user]);

  const fetchTask = async () => {
    if (!user?.id) {
      setError('User not authenticated or user ID not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = getAuthHeaders();

      const response = await fetch(`/api/${user.id}/tasks/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Task not found');
        } else {
          throw new Error('Failed to fetch task');
        }
        return;
      }

      const result = await response.json();
      setTask(result.data?.task);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the task');
    } finally {
      setLoading(false);
    }
  };

  const toggleCompletion = async () => {
    if (!task || !user?.id) return;

    try {
      const headers = getAuthHeaders();
      headers['Content-Type'] = 'application/json';

      const response = await fetch(`/api/${user.id}/tasks/${task.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          completed: !task.completed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update the task in the local state
      setTask({ ...task, completed: !task.completed });
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the task');
    }
  };

  const deleteTask = async () => {
    if (!user?.id || !window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const headers = getAuthHeaders();

      const response = await fetch(`/api/${user.id}/tasks/${task?.id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Redirect back to tasks list
      router.push('/tasks');
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the task');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view task details</h2>
          <Link href="/login" className="text-blue-600 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading task...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
        <Link href="/tasks" className="text-blue-600 hover:text-blue-900">
          ← Back to Tasks
        </Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Task not found</p>
          <Link href="/tasks" className="text-blue-600 hover:text-blue-900 mt-4 inline-block">
            ← Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold">Task Details</h1>
        <Link href="/tasks" className="text-blue-600 hover:text-blue-900">
          ← Back to Tasks
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-start mb-6">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={toggleCompletion}
            className="h-5 w-5 text-blue-600 rounded mt-1"
          />
          <div className="ml-4">
            <h2 className={`text-xl font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h2>
            {task.description && (
              <p className={`mt-2 text-gray-700 ${task.completed ? 'line-through' : ''}`}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created</h3>
            <p className="text-gray-900">{new Date(task.created_at).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Updated</h3>
            <p className="text-gray-900">{new Date(task.updated_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={toggleCompletion}
            className={`px-4 py-2 rounded ${
              task.completed
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </button>
          <button
            onClick={deleteTask}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}