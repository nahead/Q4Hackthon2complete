export interface Task {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface TaskResponse {
  success: boolean;
  data: {
    task: Task;
  };
}

export interface TasksResponse {
  success: boolean;
  data: {
    tasks: Task[];
    total: number;
  };
}