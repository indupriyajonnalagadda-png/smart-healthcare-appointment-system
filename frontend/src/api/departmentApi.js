import api from './axiosInstance';

export const departmentApi = {
  getAllDepartments: () => api.get('/departments'),
  getDepartmentById: (id) => api.get(`/departments/${id}`),
  getSpecializations: (id) => api.get(`/departments/${id}/specializations`),
};
