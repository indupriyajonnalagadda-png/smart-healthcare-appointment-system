import api from './axiosInstance';

export const notificationApi = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};
