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

export interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  profilePhotoUrl?: string | null;
  phone?: string;
  location?: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
}

export const authApi = {
  changePassword: (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> =>
    apiClient.post<ChangePasswordResponse>('/api/auth/change-password', payload),

  forgotPassword: (email: string): Promise<ForgotPasswordResponse> =>
    apiClient.post<ForgotPasswordResponse>('/api/auth/forgot-password', { email }),

  resetPassword: (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> =>
    apiClient.post<ResetPasswordResponse>('/api/auth/reset-password', payload),
  getProfile: (): Promise<ProfileData> => apiClient.get<ProfileData>('/api/user/profile'),

  updateProfile: (payload: UpdateProfilePayload): Promise<ProfileData> =>
    apiClient.put<ProfileData>('/api/user/profile', payload),

  uploadProfilePhoto: (file: File): Promise<ProfileData> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ProfileData>('/api/user/profile/photo', formData);
  },
};
