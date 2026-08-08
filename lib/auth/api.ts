import { apiClient } from '@/lib/api-client';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  changePassword: (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> =>
    apiClient.post<ChangePasswordResponse>('/api/auth/change-password', payload),

  forgotPassword: (email: string): Promise<ForgotPasswordResponse> =>
    apiClient.post<ForgotPasswordResponse>('/api/auth/forgot-password', { email }),

  resetPassword: (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> =>
    apiClient.post<ResetPasswordResponse>('/api/auth/reset-password', payload),
};
