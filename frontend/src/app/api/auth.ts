// API service for authentication
import { UserCreate, UserLogin, AuthResponse } from '../../../../shared/types/user';
import { getAuthHeaders, setAuthToken, removeAuthToken } from '../../lib/auth';

export const authService = {
  async register(userData: UserCreate): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      // Store the token if registration is successful
      if (result.data?.token) {
        setAuthToken(result.data.token);
      }
      return result;
    } else {
      throw new Error(result.error?.message || 'Registration failed');
    }
  },

  async login(credentials: UserLogin): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (response.ok) {
      // Store the token if login is successful
      if (result.data?.token) {
        setAuthToken(result.data.token);
      }
      return result;
    } else {
      throw new Error(result.error?.message || 'Login failed');
    }
  },

  async logout(): Promise<{ success: boolean; data: { message: string } }> {
    const headers = getAuthHeaders();

    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers,
    });

    const result = await response.json();

    if (response.ok) {
      // Remove the token on successful logout
      removeAuthToken();
      return result;
    } else {
      throw new Error(result.error?.message || 'Logout failed');
    }
  },

  async getCurrentUser(): Promise<{ success: boolean; data: { user: any } }> {
    const headers = getAuthHeaders();

    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to get user info');
    }
  }
};