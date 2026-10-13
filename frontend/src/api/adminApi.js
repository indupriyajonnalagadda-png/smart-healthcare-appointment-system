import api from './axiosInstance';

export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, enabled) => api.patch(`/admin/users/${id}/status`, { enabled }),
  getAllDoctors: (params) => api.get('/admin/doctors', { params }),
  createDoctor: (data) => api.post('/admin/doctors', data),
  approveDoctor: (id, data) => api.patch(`/admin/doctors/${id}/approval`, data),
  searchAppointments: (params) => api.get('/admin/appointments', { params }),
  createDepartment: (data) => api.post('/admin/departments', data),
  createSpecialization: (data) => api.post('/admin/specializations', data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};
