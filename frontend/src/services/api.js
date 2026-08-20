// frontend/src/services/api.js

const BASE_URL = 'https://aiymed-1.onrender.com'

// Asosiy fetch funksiyasi
const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Noma\'lum xatolik' }))
      throw new Error(error.detail || 'Server xatosi')
    }
    
    // Agar response bo'sh bo'lsa (204 No Content)
    if (response.status === 204) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API Xatolik [${endpoint}]:`, error)
    throw error
  }
}

// HTTP metodlari
export const api = {
  get: (endpoint, params = {}) => {
    const queryString = Object.keys(params).length 
      ? '?' + new URLSearchParams(params).toString()
      : ''
    return apiRequest(`${endpoint}${queryString}`, { method: 'GET' })
  },
  
  post: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  
  put: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  
  patch: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
  
  delete: (endpoint) => {
    return apiRequest(endpoint, { method: 'DELETE' })
  },
}

export default api