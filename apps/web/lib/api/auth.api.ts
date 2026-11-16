import { apiClient } from './client';
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
  ApiResponse,
  User,
} from '@linkforge/shared';

export const authApi = {
  async register(input: RegisterInput): Promise<{ user: User; accessToken: string }> {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string }>>(
      '/api/v1/auth/register',
      input
    );
    return res.data.data!;
  },

  async login(input: LoginInput): Promise<{ user: User; accessToken: string }> {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string }>>(
      '/api/v1/auth/login',
      input
    );
    return res.data.data!;
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/v1/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/api/v1/auth/me');
    return res.data.data!;
  },

  async updateProfile(input: UpdateProfileInput): Promise<User> {
    const res = await apiClient.patch<ApiResponse<User>>('/api/v1/auth/profile', input);
    return res.data.data!;
  },

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await apiClient.post('/api/v1/auth/change-password', input);
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/api/v1/auth/account');
  },
};
