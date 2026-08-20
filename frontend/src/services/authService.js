// frontend/src/services/authService.js
import api from './api'

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      return response
    } catch (error) {
      console.error('Login xatosi:', error)
      throw error
    }
  },
  
  logout: () => {
    return api.post('/auth/logout')
  },
  
  getCurrentUser: () => {
    return api.get('/auth/me')
  },
}