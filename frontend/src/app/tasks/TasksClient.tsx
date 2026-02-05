'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calendar } from 'lucide-react';
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

export default function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Error loading tasks</h2>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {tasks.map((task) => (
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
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}