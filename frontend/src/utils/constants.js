// frontend/src/utils/constants.js

// To'lov turlari (faqat value va color, label komponentlarda tarjima qilinadi)
export const PAYMENT_TYPES = [
  { value: 'wholesale_30', color: 'bg-blue-100 text-blue-800' },
  { value: 'wholesale_50', color: 'bg-purple-100 text-purple-800' },
  { value: 'wholesale_100', color: 'bg-green-100 text-green-800' },
  { value: 'retail', color: 'bg-orange-100 text-orange-800' }
]

// Rollar (faqat value va color, label komponentlarda tarjima qilinadi)
export const ROLES = [
  { value: 'admin', color: 'bg-red-100 text-red-800' },
  { value: 'director', color: 'bg-purple-100 text-purple-800' },
  { value: 'marketing', color: 'bg-blue-100 text-blue-800' },
  { value: 'sales', color: 'bg-green-100 text-green-800' }
]

// Hududlar (kalitlar - komponentlarda t() bilan tarjima qilinadi)
export const REGIONS = [
  "tashkent_city",
  "tashkent_region",
  "samarkand",
  "bukhara",
  "fargana",
  "andijan",
  "namangan",
  "qashqadaryo",
  "surkhandarya",
  "jizzakh",
  "syrdarya",
  "navoi",
  "karakalpakstan",
  "khorezm"
]

// Buyurtma holatlari (faqat kalitlar)
export const ORDER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

// Faqat rang va icon (matn YO'Q - matn komponentlarda tarjima qilinadi)
export const ORDER_STATUS_BADGES = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏳'
  },
  approved: {
    color: 'bg-green-100 text-green-800',
    icon: '✅'
  },
  rejected: {
    color: 'bg-red-100 text-red-800',
    icon: '❌'
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800',
    icon: '🚫'
  }
}