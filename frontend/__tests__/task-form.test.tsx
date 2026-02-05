import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRouter } from 'next/navigation';
import TaskForm from '../src/components/task-form';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the auth utility
vi.mock('../src/lib/auth', () => ({
  getAuthHeaders: () => ({ authorization: 'Bearer test-token' }),
}));

describe('TaskForm', () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    (useRouter as any).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders create form correctly', () => {
    render(<TaskForm />);

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('renders edit form correctly', () => {
    render(<TaskForm isEditing={true} initialData={{ title: 'Test Task', description: 'Test Description' }} />);

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<TaskForm />);

    fireEvent.click(screen.getByText('Create Task'));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(<TaskForm userId={1} />);

    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Task Description' } });
    fireEvent.click(screen.getByText('Create Task'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer test-token'
        },
        body: JSON.stringify({
          title: 'New Task',
          description: 'Task Description'
        })
      });
    });
  });

  it('handles submission errors', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Failed to create task' } }),
    });

    render(<TaskForm userId={1} />);

    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'New Task' } });
    fireEvent.click(screen.getByText('Create Task'));

    await waitFor(() => {
      expect(screen.getByText('Failed to create task')).toBeInTheDocument();
    });
  });

  it('requires userId for creating tasks', async () => {
    render(<TaskForm />); // No userId provided

    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'New Task' } });
    fireEvent.click(screen.getByText('Create Task'));

    await waitFor(() => {
      expect(screen.getByText('User ID is required for creating a new task')).toBeInTheDocument();
    });
  });
});