import { apiClient } from './api-client';

export interface NotificationItem {
  id: number;
  userId?: number;
  type: string; // "order", "product", "message", "broadcast"
  title: string;
  body: string;
  createdAt: string; // ISO datetime
  isUnread: boolean;
}

export const notificationsApi = {
  getAll: () => apiClient.get<NotificationItem[]>('/api/notifications'),
  markAsRead: (id: number) => apiClient.put<{ message: string }>(`/api/notifications/${id}/read`, {}),
};
