import api from './axiosInstance';

export const prescriptionApi = {
  addPrescription: (appointmentId, data) => api.post(`/appointments/${appointmentId}/prescription`, data),
  getPrescriptionByAppointment: (appointmentId) => api.get(`/appointments/${appointmentId}/prescription`),
  getMyPrescriptions: () => api.get('/prescriptions/my'),
};
