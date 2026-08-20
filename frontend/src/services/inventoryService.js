// frontend/src/services/inventoryService.js
import api from './api'

export const inventoryService = {
  getAll: () => {
    return api.get('/inventory/')
  },
  
  getByProduct: (productId) => {
    return api.get(`/inventory/${productId}`)
  },
  
  createOrUpdate: (data) => {
    return api.post('/inventory/', data)
  },
  
  update: (productId, data) => {
    return api.put(`/inventory/${productId}`, data)
  },
  
  delete: (productId) => {
    return api.delete(`/inventory/${productId}`)
  }
}