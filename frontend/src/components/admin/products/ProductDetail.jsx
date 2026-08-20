// frontend/src/components/admin/products/ProductDetail.jsx
import { useState, useEffect } from 'react'
import { productService } from '../../../services/productService'
import { inventoryService } from '../../../services/inventoryService'
import { formatMoney } from '../../../utils/format'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next'

// ✅ 1-O'ZGARISH: readOnly va hideRetailPrice prop qo'shildi
function ProductDetail({ productId, onBack, onEdit, readOnly = false, hideRetailPrice = false }) {
  const { t } = useTranslation()
  const [product, setProduct] = useState(null)
  const [inventory, setInventory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [productId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productData, invData] = await Promise.all([
        productService.getById(productId),
        inventoryService.getByProduct(productId)
      ])
      setProduct(productData)
      setInventory(invData)
    } catch (error) {
      console.error(t('productDetail.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading fullScreen text={t('productDetail.loading')} />
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t('common.no_data')}</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          {t('buttons.back')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-gray-500 mt-1">{t('productDetail.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onBack} variant="secondary">
            {t('buttons.back')}
          </Button>
          
          {/* ✅ 2-O'ZGARISH: "Tahrirlash" tugmasi faqat readOnly=false bo'lganda ko'rsatiladi */}
          {!readOnly && (
            <Button onClick={() => onEdit(productId)} variant="warning">
              ✏️ {t('buttons.edit')}
            </Button>
          )}
        </div>
      </div>

      {/* Rasm va asosiy ma'lumotlar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rasm */}
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📷 {t('productDetail.product_image')}</h3>
          {product.image_url ? (
            <div 
              onClick={() => setShowImageModal(true)}
              className="cursor-pointer"
            >
              <img 
                src={`https://aiymed-1.onrender.com${product.image_url.replace('uploads/', '')}`} 
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg hover:opacity-90 transition"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3E📷%3C/text%3E%3C/svg%3E'
                }}
              />
              <p className="text-sm text-gray-500 mt-2 text-center">{t('productDetail.click_to_zoom')}</p>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-6xl">
              📷
            </div>
          )}
          
          {/* ✅ 3-O'ZGARISH: "Rasm yuklash" inputi faqat readOnly=false bo'lganda ko'rsatiladi */}
          {!readOnly && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('productDetail.upload_image')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0]
                  if (file) {
                    try {
                      await productService.uploadImage(productId, file)
                      alert(t('productDetail.image_uploaded_success'))
                      fetchData()
                    } catch (error) {
                      alert(t('common.error') + ': ' + error.message)
                    }
                  }
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          )}
        </Card>

        {/* Rasm Modal (Kattalashtirilgan) */}
        {showImageModal && product.image_url && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <button
              className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300"
              onClick={() => setShowImageModal(false)}
            >
              ×
            </button>
            <img 
              src={`https://aiymed-1.onrender.com${product.image_url.replace('uploads/', '')}`} 
              alt={product.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        )}

        {/* Narxlar */}
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💰 {t('productDetail.prices')}</h3>
          {inventory ? (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">{t('productDetail.wholesale_30')}</p>
                <p className="text-xl font-bold text-blue-600">{formatMoney(inventory.price_30)}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">{t('productDetail.wholesale_50')}</p>
                <p className="text-xl font-bold text-purple-600">{formatMoney(inventory.price_50)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">{t('productDetail.wholesale_100')}</p>
                <p className="text-xl font-bold text-green-600">{formatMoney(inventory.price_100)}</p>
              </div>
              
              {/* ✅ 4-O'ZGARISH: Chakana narx faqat hideRetailPrice=false bo'lganda ko'rinadi */}
              {!hideRetailPrice && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">{t('productDetail.retail')}</p>
                  <p className="text-xl font-bold text-orange-600">{formatMoney(inventory.price_retail || 0)}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('productDetail.no_inventory_data')}</p>
          )}
        </Card>

        {/* Ombor */}
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📦 {t('productDetail.inventory')}</h3>
          {inventory ? (
            <div className="text-center">
              <p className="text-6xl font-bold text-blue-600">{inventory.stock_quantity}</p>
              <p className="text-gray-500 mt-2">{t('productDetail.units_in_stock')}</p>
              <div className={`mt-4 p-3 rounded-lg ${inventory.stock_quantity > 10 ? 'bg-green-50' : inventory.stock_quantity > 0 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <p className={`font-bold ${inventory.stock_quantity > 10 ? 'text-green-600' : inventory.stock_quantity > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {inventory.stock_quantity > 10 ? t('productDetail.stock_sufficient') : inventory.stock_quantity > 0 ? t('productDetail.stock_low') : t('productDetail.stock_empty')}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('productDetail.no_inventory_data')}</p>
          )}
        </Card>
      </div>

      {/* Tafsilotlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📝 {t('productDetail.description_title')}</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {product.description || t('productDetail.no_description')}
          </p>
        </Card>

        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📖 {t('productDetail.instruction_title')}</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {product.instruction || t('productDetail.no_instruction')}
          </p>
        </Card>

        <Card padding="md" className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ {t('productDetail.characteristics_title')}</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {product.characteristics || t('productDetail.no_characteristics')}
          </p>
        </Card>
      </div>
    </div>
  )
}

export default ProductDetail