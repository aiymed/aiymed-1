// frontend/src/services/authService.js
// TO'G'RIDAN-TO'G'RI URL - HECH QANDAY .env YO'Q

const API_BASE_URL = 'https://aiymed-1.onrender.com';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Login xatosi' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login xatosi:', error);
      throw error;
    }
  },
  
  logout: async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Logout xatosi:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Not authenticated');
      return await response.json();
    } catch (error) {
      console.error('GetUser xatosi:', error);
      throw error;
    }
  },
}