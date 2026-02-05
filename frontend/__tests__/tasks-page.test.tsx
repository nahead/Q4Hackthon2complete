import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import TasksPage from '../src/app/tasks/page';
import { useAuth } from '../src/contexts/AuthContext';
import { taskService } from '../src/app/api/tasks';

// Mock the authentication context
vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the task service
vi.mock('../src/app/api/tasks', () => ({
  taskService: {
    getTasks: vi.fn(),
  },
}));

// Mock the next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/tasks'),
}));

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    AnimatePresence: ({ children }: any) => <div>{children}</div>,
  };
});

// Mock dynamic imports
vi.mock('next/dynamic', () => ({
  default: (fn: any) => fn().then((mod: any) => mod.default),
}));

describe('TasksPage', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: true,
    });

    render(
      <MockedProvider>
        <TasksPage />
      </MockedProvider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows login prompt when not authenticated', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
    });

    render(
      <MockedProvider>
        <TasksPage />
      </MockedProvider>
    );

    expect(screen.getByText(/log in to view tasks/i)).toBeInTheDocument();
  });

  it('fetches and displays tasks when authenticated', async () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Test Task 1',
        completed: false,
        created_at: '2023-01-01T00:00:00Z',
        user_id: 1,
      },
      {
        id: 2,
        title: 'Test Task 2',
        completed: true,
        created_at: '2023-01-02T00:00:00Z',
        user_id: 1,
      },
    ];

    (taskService.getTasks as any).mockResolvedValue({
      success: true,
      data: { tasks: mockTasks, total: 2 },
    });

    render(
      <MockedProvider>
        <TasksPage />
      </MockedProvider>
    );

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });

    // Check that stats are displayed
    expect(screen.getByText('2 tasks')).toBeInTheDocument();
    expect(screen.getByText('1 completed')).toBeInTheDocument();
    expect(screen.getByText('1 pending')).toBeInTheDocument();
  });

  it('shows empty state when no tasks exist', async () => {
    (taskService.getTasks as any).mockResolvedValue({
      success: true,
      data: { tasks: [], total: 0 },
    });

    render(
      <MockedProvider>
        <TasksPage />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });
  });
});