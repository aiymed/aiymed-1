// frontend/src/utils/format.js
import i18next from 'i18next'

// Joriy tilni aniqlash
const getCurrentLang = () => {
  return i18next.language || localStorage.getItem('language') || 'uz'
}

// Raqamni probel bilan ajratish (barcha tillar uchun bir xil)
const formatWithSpaces = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// ✅ YANGILANDI: Pul formatlash (2 xonagacha yaxlitlash bilan)
export const formatMoney = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '0'
  
  // Son turiga o'tkazamiz va 2 xonagacha yaxlitlaymiz
  const numAmount = Number(amount)
  if (isNaN(numAmount)) return '0'
  
  // .toFixed(2) sonni har doim 2 xonali kasr bilan qaytaradi (masalan: "453428.57")
  const roundedAmount = numAmount.toFixed(2)
  
  const lang = getCurrentLang()
  const formattedNumber = formatWithSpaces(roundedAmount)

  // Tilga qarab valyuta belgisini qo'shish
  switch (lang) {
    case 'ru':
      return `${formattedNumber} сум`
    case 'en':
    case 'hi':
      return `${formattedNumber} UZS`
    case 'uz':
    default:
      return `${formattedNumber} so'm`
  }
}

// Sana formatlash
export const formatDate = (date) => {
  if (!date) return '-'
  
  const lang = getCurrentLang()
  let locale = 'uz-UZ'
  if (lang === 'ru') locale = 'ru-RU'
  else if (lang === 'en') locale = 'en-US'
  else if (lang === 'hi') locale = 'hi-IN'

  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Raqam formatlash (faqat probel bilan ajratish, butun sonlar uchun)
export const formatNumber = (number) => {
  if (number === null || number === undefined || number === '') return '0'
  
  return formatWithSpaces(Math.round(number))
}

// Foiz hisoblash
export const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0
  return ((part / total) * 100).toFixed(1)
}