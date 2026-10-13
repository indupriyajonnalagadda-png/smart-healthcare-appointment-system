import api from './axiosInstance';

export const aiApi = {
  getDoctorRecommendations: (data) => api.post('/ai/doctor-recommendations', data),
};
