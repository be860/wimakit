import { apiClient } from '@/lib/api-client';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.post<{ success: boolean; message: string }>('/api/auth/change-password', payload),
};
