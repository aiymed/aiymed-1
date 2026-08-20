// frontend/src/services/authService.js

// Vaqtinchalik to'g'ridan-to'g'ri URL ishlatamiz (kesh muammosini yo'qotish uchun)
const API_URL = 'https://aiymed-1.onrender.com';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login xatosi');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login xatosi:', error);
      throw error;
    }
  },
  
  logout: async () => {
    return await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
  },
  
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  },
}