import api from './axiosInstance';

export const appointmentApi = {
  bookAppointment: (data) => api.post('/appointments', data),
  getMyAppointments: (status) => api.get('/appointments/my', { params: { status } }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  cancelAppointment: (id, reason) => api.patch(`/appointments/${id}/cancel`, { reason }),
  updateStatus: (id, status, comments) => api.patch(`/appointments/${id}/status`, { status, comments }),
};
