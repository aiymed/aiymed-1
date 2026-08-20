// frontend/src/components/admin/products/ProductForm.jsx
import { useState, useEffect } from 'react'
import { productService } from '../../../services/productService'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Input from '../../common/Input'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next' // ✅ Import qo'shildi

function ProductForm({ onBack, editingProductId }) {
  const { t } = useTranslation() // ✅ Hook chaqirildi
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instruction: '',
    characteristics: ''
  })

  useEffect(() => {
    if (editingProductId) {
      loadProductData()
    }
  }, [editingProductId])

  const loadProductData = async () => {
    setLoading(true)
    try {
      const product = await productService.getById(editingProductId)
      setFormData({
        name: product.name || '',
        description: product.description || '',
        instruction: product.instruction || '',
        characteristics: product.characteristics || ''
      })
    } catch (error) {
      console.error(t('productForm.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name) {
      alert(t('productForm.enter_name'))
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        instruction: formData.instruction,
        characteristics: formData.characteristics
      }

      if (editingProductId) {
        await productService.update(editingProductId, payload)
        alert(t('productForm.updated_success'))
      } else {
        const result = await productService.create(payload)
        alert(t('productForm.created_success'))
        
        // Yangi mahsulot ID'sini olish
        if (result.id) {
          editingProductId = result.id
        }
      }
      
      if (onBack) onBack()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && editingProductId) {
    return <Loading fullScreen text={t('productForm.loading_data')} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {editingProductId ? t('productForm.edit_title') : t('productForm.create_title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {editingProductId ? t('productForm.edit_subtitle') : t('productForm.create_subtitle')}
          </p>
        </div>
        <Button onClick={onBack} variant="secondary">
          {t('buttons.back')}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card padding="md">
          <div className="space-y-6">
            <Input
              label={t('productForm.name')}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={t('productForm.name_placeholder')}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('productForm.description')}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t('productForm.description_placeholder')}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('productForm.instruction')}</label>
              <textarea
                value={formData.instruction}
                onChange={(e) => setFormData({...formData, instruction: e.target.value})}
                placeholder={t('productForm.instruction_placeholder')}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('productForm.characteristics')}</label>
              <textarea
                value={formData.characteristics}
                onChange={(e) => setFormData({...formData, characteristics: e.target.value})}
                placeholder={t('productForm.characteristics_placeholder')}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-4 mt-6">
          <Button type="submit" variant="primary" disabled={loading} className="flex-1">
            {loading ? t('common.saving') : (editingProductId ? t('buttons.update') : t('buttons.create'))}
          </Button>
          <Button type="button" onClick={onBack} variant="secondary">
            {t('buttons.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm