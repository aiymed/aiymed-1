// frontend/src/services/orderService.js
import api from './api'

export const orderService = {
  // Barcha buyurtmalarni olish
  getAll: (filters = {}) => {
    return api.get('/orders/', filters)
  },
  
  // Foydalanuvchi buyurtmalari
  getByUser: (userId) => {
    return api.get(`/orders/user/${userId}`)
  },
  
  // Bitta buyurtmani olish
  getById: (id) => {
    return api.get(`/orders/${id}`)
  },

  // ✅ YANGI QO'SHILDI: Buyurtmani butunlay o'chirish
  deleteOrder: (id) => {
    return api.delete(`/orders/${id}`)
  },
  
  // Yangi buyurtma yaratish
  create: (data) => {
    return api.post('/orders/', data)
  },
  
  // ✅ TUZATILDI: Buyurtmani tahrirlash (endpoint o'zgartirildi)
  update: (id, data) => {
    return api.put(`/orders/${id}`, data)  //  /edit olib tashlandi
  },
  
  // Buyurtma holatini o'zgartirish
  updateStatus: (id, status) => {
    return api.patch(`/orders/${id}/status?status=${status}`)
  },
  
  // Mijoz to'lovlari
  getClientPayments: (clientId) => {
    return api.get(`/orders/payments/client/${clientId}`)
  },
  
  // Barcha mijozlar qarzdorligi
  getClientsDebt: (region = '') => {
    const params = region ? { region } : {}
    return api.get('/orders/payments/clients-debt', params)
  },
  
  // To'lov qo'shish
  addPayment: (data) => {
    return api.post('/orders/payments', data)
  },
  
  // To'lovni tahrirlash
  updatePayment: (id, data) => {
    return api.put(`/orders/payments/${id}`, data)
  },
  
  // To'lovni o'chirish
  deletePayment: (id) => {
    return api.delete(`/orders/payments/${id}`)
  },
  
  // Admin hisobot
  getAdminReport: (queryString) => {
    return api.get(`/orders/report/all-admin?${queryString}`)
  },
  
  // Batafsil hisobot
  getDetailedReport: (region = '') => {
    const params = region ? { region } : {}
    return api.get('/orders/report/detailed', params)
  },
  
  // Savdo vakili hisobot
  getSalesReport: (userId) => {
    return api.get(`/orders/report/${userId}`)
  },
  
  // Savdo vakili analitikasi
  getSalesRepAnalytics: (userId) => {
    return api.get(`/orders/analytics/sales-rep/${userId}`)
  },
  
  // Mahsulot analitikasi
  getProductAnalytics: () => {
    return api.get('/orders/analytics/products')
  },
  
  // KPI ko'rsatkichlari
  getKPI: () => {
    return api.get('/orders/analytics/kpi')
  },

  // To'lovni tahrirlash
  updatePayment: (paymentId, data) => {
    return api.put(`/orders/payments/${paymentId}`, data)
  },
  
  // To'lovni o'chirish
  deletePayment: (paymentId) => {
    return api.delete(`/orders/payments/${paymentId}`)
  },

  // Xodim hisobotini olish
  getEmployeeReport: (employeeId) => {
    return api.get(`/orders/report/employee/${employeeId}`)
  },

  // Xodimlar KPI hisobotini olish
  getEmployeesKPI: () => {
    return api.get('/orders/report/employees-kpi')
  },

  // Mahsulot analitikasi (xodim bo'yicha filtr bilan)
  getProductsAnalysis: (employeeId = null) => {
    const params = employeeId ? { employee_id: employeeId } : {}
    return api.get('/orders/report/products-analysis', params)
  },

  // Hududlar bo'yicha savdo hisobotini olish
  getRegionsSales: () => {
    return api.get('/orders/report/regions-sales')
  },

  // To'lov turlari bo'yicha taqsimot hisobotini olish (UMUMIY - Admin/Director uchun)
  getPaymentTypesDistribution: () => {
    return api.get('/orders/report/payment-types')
  },

  // ✅ YANGI: To'lov turlari bo'yicha taqsimot (SALES uchun, region bilan)
  getPaymentTypesDistributionByRegion: (region) => {
    return api.get('/orders/report/payment-types-sales', { region })
  }
}