import { apiClient } from './api';

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'customer' | 'vendor';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: 'customer' | 'vendor' | 'admin';
      status: string;
      firstName?: string;
      lastName?: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export const authApi = {
  register: (data: RegisterData) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  login: (data: LoginData) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh-token', { refreshToken }),

  getCurrentUser: () =>
    apiClient.get('/auth/me'),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),
};
