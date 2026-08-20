// frontend/src/services/employeeService.js
import api from './api'

export const employeeService = {
  getAll: () => {
    return api.get('/admin/users')
  },
  
  getById: (id) => {
    return api.get(`/admin/users/${id}`)
  },
  
  create: (data) => {
    return api.post('/admin/users', data)
  },
  
  update: (id, data) => {
    return api.put(`/admin/users/${id}`, data)
  },
  
  delete: (id) => {
    return api.delete(`/admin/users/${id}`)
  },
  
  getStats: (id) => {
    return api.get(`/admin/users/${id}/stats`)
  },
}