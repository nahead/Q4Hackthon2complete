'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAuthHeaders } from '../../lib/auth';
import dynamic from 'next/dynamic';

// Dynamically import SVG icons to avoid hydration issues
const CheckCircle2 = dynamic(() => import('lucide-react').then(mod => mod.CheckCircle2), {
  ssr: false,
  loading: () => <div className="w-5 h-5" />
});

const Circle = dynamic(() => import('lucide-react').then(mod => mod.Circle), {
  ssr: false,
  loading: () => <div className="w-5 h-5" />
});

const Sparkles = dynamic(() => import('lucide-react').then(mod => mod.Sparkles), {
  ssr: false,
  loading: () => <div className="w-8 h-8" />
});

const Check = dynamic(() => import('lucide-react').then(mod => mod.Check), {
  ssr: false,
  loading: () => <div className="w-4 h-4" />
});

interface Task {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  user_id: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasks();
    }
  }, [isAuthenticated, user]);

  const fetchTasks = async () => {
    if (!user?.id) {
      console.error('User not authenticated or user ID not available');
      setLoading(false);
      return;
    }

    try {
      // Direct call to backend API to bypass proxy issues
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const headers = getAuthHeaders();

      const response = await fetch(`${backendUrl}/api/${user.id}/tasks`, {
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.data?.tasks || []);
      } else {
        console.error('Failed to fetch tasks:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: number, currentStatus: boolean) => {
    if (!user?.id) {
      console.error('User not authenticated or user ID not available');
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const headers = getAuthHeaders();
      headers['Content-Type'] = 'application/json';

      const response = await fetch(`${backendUrl}/api/${user.id}/tasks/${taskId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!response.ok) {
        console.error('Failed to update task:', response.status, response.statusText);
        return;
      }

      // Refresh the task list to ensure consistency with server state
      const refreshResponse = await fetch(`${backendUrl}/api/${user.id}/tasks`, {
        headers: getAuthHeaders(),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setTasks(data.data?.tasks || []);
      } else {
        console.error('Failed to refresh tasks after update:', refreshResponse.status, refreshResponse.statusText);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!user?.id) {
      console.error('User not authenticated or user ID not available');
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const headers = getAuthHeaders();

      const response = await fetch(`${backendUrl}/api/${user.id}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (!response.ok) {
        console.error('Failed to delete task:', response.status, response.statusText);
        return;
      }

      const responseJson = await response.json();
      if (responseJson.success) {
        // Refresh the task list to ensure consistency with server state
        const refreshResponse = await fetch(`${backendUrl}/api/${user.id}/tasks`, {
          headers: getAuthHeaders(),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setTasks(data.data?.tasks || []);
        } else {
          console.error('Failed to refresh tasks after deletion:', refreshResponse.status, refreshResponse.statusText);
        }
      } else {
        console.error('Task deletion failed:', responseJson);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view tasks</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary/5 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-ai-gradient bg-clip-text text-transparent">
                My Tasks
              </h1>
              <p className="text-muted-foreground mt-1">
                {Array.isArray(tasks) ? tasks.length : 0} {Array.isArray(tasks) && tasks.length === 1 ? 'task' : 'tasks'} •{' '}
                {Array.isArray(tasks) ? tasks.filter(t => t.completed).length : 0} completed
              </p>
            </div>
            <a href="/tasks/new" className="bg-ai-gradient hover:bg-ai-gradient-secondary text-white rounded-md px-4 py-2 font-medium transition-colors">
              <Plus className="w-4 h-4 mr-2 inline" />
              New Task
            </a>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="glass-effect bg-background/60 backdrop-blur-lg border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{Array.isArray(tasks) ? tasks.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect bg-background/60 backdrop-blur-lg border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mr-3">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{Array.isArray(tasks) ? tasks.filter(t => t.completed).length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect bg-background/60 backdrop-blur-lg border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mr-3">
                  <Circle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{Array.isArray(tasks) ? tasks.filter(t => !t.completed).length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect bg-background/60 backdrop-blur-lg border-border/50">
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(tasks) && tasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first task to get started
                  </p>
                  <a href="/tasks/new" className="bg-ai-gradient hover:bg-ai-gradient-secondary text-white rounded-md px-4 py-2 font-medium transition-colors inline-flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {Array.isArray(tasks) ? tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`flex items-center justify-between p-4 rounded-xl ${
                          task.completed
                            ? 'bg-green-500/10 border border-green-500/20'
                            : 'bg-muted/30 border border-border/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleTaskCompletion(task.id, task.completed)}
                            className={`w-8 h-8 rounded-full ${
                              task.completed
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'border border-input hover:bg-accent'
                            }`}
                          >
                            {task.completed ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </Button>
                          <div>
                            <p className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(task.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )) : []}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}