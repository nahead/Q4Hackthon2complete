'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Task } from '../../../shared/types/task';
import { getAuthHeaders } from '../lib/auth';

interface TaskItemProps {
  task: Task;
  onUpdate?: (updatedTask: Task) => void;
  onDelete?: (taskId: number) => void;
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleCompletion = async () => {
    try {
      const headers = getAuthHeaders();
      headers['Content-Type'] = 'application/json';

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          completed: !task.completed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const result = await response.json();
      if (onUpdate) {
        onUpdate(result.data?.task);
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while updating the task');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const headers = getAuthHeaders();

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      if (onDelete) {
        onDelete(task.id);
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting the task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 flex justify-between items-center ${
        task.completed ? 'bg-green-50' : 'bg-white'
      }`}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={toggleCompletion}
          className="h-4 w-4 text-blue-600 rounded mr-3"
        />
        <div>
          <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-sm mt-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-500'}`}>
              {task.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex space-x-2">
        <Link
          href={`/tasks/${task.id}`}
          className="text-blue-600 hover:text-blue-900 text-sm"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`text-sm ${isDeleting ? 'text-gray-400' : 'text-red-600 hover:text-red-900'}`}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}