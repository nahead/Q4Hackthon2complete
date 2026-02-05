'use client';

import TaskForm from '../../../components/task-form';
import { useAuth } from '../../../contexts/AuthContext';

export default function NewTaskPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to create a task</h2>
          <a href="/login" className="text-blue-600 hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TaskForm userId={user.id} />
    </div>
  );
}