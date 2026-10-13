import api from './axiosInstance';

export const doctorApi = {
  searchDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getDoctorAvailability: (id, date) => api.get(`/doctors/${id}/availability`, { params: { date } }),
  getMyProfile: () => api.get('/doctors/me/profile'),
  updateMyProfile: (data) => api.put('/doctors/me/profile', data),
  getMyAvailability: () => api.get('/doctors/me/availability'),
  updateMyAvailability: (data) => api.put('/doctors/me/availability', data),
  addException: (data) => api.post('/doctors/me/exceptions', data),
  deleteException: (id) => api.delete(`/doctors/me/exceptions/${id}`),
};
