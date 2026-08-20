// frontend/src/utils/helpers.js

// QQS hisoblash (12%)
export const calculateVAT = (total) => {
  return total * 12 / 112
}

// Oldindan to'lovni hisoblash
export const calculatePrepayment = (total, paymentType) => {
  switch (paymentType) {
    case 'retail':
      return total
    case 'wholesale_30':
      return total * 0.3
    case 'wholesale_100':
      return total
    case 'wholesale_50':
    default:
      return total * 0.5
  }
}

// Qolgan qarzni hisoblash
export const calculateRemaining = (total, paymentType) => {
  const prepayment = calculatePrepayment(total, paymentType)
  return paymentType === 'retail' ? 0 : total - prepayment
}

// Mahsulot narxini olish (to'lov turiga qarab)
export const getProductPrice = (product, paymentType) => {
  switch (paymentType) {
    case 'wholesale_30':
      return product.price_30
    case 'wholesale_100':
      return product.price_100
    case 'retail':
      return product.price_retail || product.price_50
    case 'wholesale_50':
    default:
      return product.price_50
  }
}