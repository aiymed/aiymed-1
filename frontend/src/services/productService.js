// frontend/src/services/productService.js
import api from './api'

export const productService = {
  getAll: () => {
    return api.get('/products/')
  },
  
  getById: (id) => {
    return api.get(`/products/${id}`)
  },
  
  create: (data) => {
    return api.post('/products/', data)
  },
  
  update: (id, data) => {
    return api.put(`/products/${id}`, data)
  },
  
  delete: (id) => {
    return api.delete(`/products/${id}`)
  },
  
  uploadImage: async (productId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`https://aiymed-1.onrender.com${productId}/upload-image`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Rasm yuklashda xatolik')
    }
    
    return await response.json()
  }
}