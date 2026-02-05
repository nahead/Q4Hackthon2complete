export interface User {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}