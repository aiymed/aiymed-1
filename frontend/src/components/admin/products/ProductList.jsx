// frontend/src/components/admin/products/ProductList.jsx
import { useState, useEffect } from 'react'
import { productService } from '../../../services/productService'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Table from '../../common/Table'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next'

// ✅ 1-O'ZGARISH: readOnly prop qo'shildi (default qiymati false)
function ProductList({ onNavigate, readOnly = false }) {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await productService.getAll()
      setProducts(data)
    } catch (error) {
      console.error(t('productList.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(t('productList.confirm_delete', { name: productName }))) {
      return
    }

    try {
      await productService.delete(productId)
      alert(t('productList.delete_success'))
      fetchProducts()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    }
  }

  const filteredProducts = products.filter(product => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return product.name?.toLowerCase().includes(searchLower)
  })

  const columns = [
    { 
      header: t('productList.no'), 
      accessor: 'id',
      render: (_, row, index) => index + 1
    },
    { 
      header: t('productList.image'), 
      accessor: 'image_url',
      render: (value) => value ? (
        <img src={`http://127.0.0.1:8000/${value}`} alt={t('productList.product_image_alt')} className="w-16 h-16 object-cover rounded" />
      ) : (
        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">📷</div>
      )
    },
    { 
      header: t('productList.name'), 
      accessor: 'name',
      render: (value) => <span className="font-bold text-gray-900">{value}</span>
    },
    { 
      header: t('productList.description'), 
      accessor: 'description',
      render: (value) => <span className="text-gray-600 text-sm">{value || '-'}</span>
    },
    
    // ✅ 2-O'ZGARISH: "Amallar" ustuni faqat readOnly=false bo'lganda qo'shiladi
    ...(readOnly ? [] : [{
      header: t('productList.actions'),
      accessor: 'id',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('edit-product', row.id) }}
            className="text-blue-600 hover:text-blue-800 font-bold text-sm"
            title={t('buttons.edit')}
          >
            ✏️
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id, row.name) }}
            className="text-red-600 hover:text-red-800 font-bold text-sm"
            title={t('buttons.delete')}
          >
            🗑️
          </button>
        </div>
      )
    }])
  ]

  if (loading) {
    return <Loading fullScreen text={t('productList.loading')} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('productList.title')}</h1>
          <p className="text-gray-500 mt-1">{t('productList.subtitle', { count: filteredProducts.length })}</p>
        </div>
        
        {/* ✅ 3-O'ZGARISH: "Yangi mahsulot" tugmasi faqat readOnly=false bo'lganda ko'rsatiladi */}
        {!readOnly && (
          <Button onClick={() => onNavigate('new-product')} variant="primary">
            {t('buttons.new_product')}
          </Button>
        )}
      </div>

      <Card padding="md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('productList.search')}</label>
          <input
            type="text"
            placeholder={t('productList.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      <Card padding="none">
        <Table
          columns={columns}
          data={filteredProducts}
          onRowClick={(row) => onNavigate('product-detail', row.id)}
          emptyMessage={t('productList.no_products')}
        />
      </Card>
    </div>
  )
}

export default ProductList