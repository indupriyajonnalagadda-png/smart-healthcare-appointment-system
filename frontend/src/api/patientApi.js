import api from './axiosInstance';

export const patientApi = {
  getMyProfile: () => api.get('/patients/me'),
  updateMyProfile: (data) => api.put('/patients/me', data),
};
