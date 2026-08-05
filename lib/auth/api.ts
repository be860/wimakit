import { apiClient } from '@/lib/api-client';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  changePassword: (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> =>
    apiClient.post<ChangePasswordResponse>('/api/auth/change-password', payload),
};
