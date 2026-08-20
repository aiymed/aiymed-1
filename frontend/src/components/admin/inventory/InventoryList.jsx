// frontend/src/components/admin/inventory/InventoryList.jsx
import { useState, useEffect } from 'react'
import { inventoryService } from '../../../services/inventoryService'
import { productService } from '../../../services/productService'
import { formatMoney } from '../../../utils/format'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Input from '../../common/Input'
import Select from '../../common/Select'
import Table from '../../common/Table'
import Loading from '../../common/Loading'
import Modal from '../../common/Modal'
import { useTranslation } from 'react-i18next'

// ✅ 1-O'ZGARISH: readOnly prop qo'shildi (default qiymati false)
function InventoryList({ onNavigate, readOnly = false }) {
  const { t } = useTranslation()
  const [inventory, setInventory] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    product_id: '',
    stock_quantity: 0,
    price_30: 0,
    price_50: 0,
    price_100: 0,
    price_retail: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [invData, prodData] = await Promise.all([
        inventoryService.getAll(),
        productService.getAll()
      ])
      setInventory(invData)
      setProducts(prodData)
    } catch (error) {
      console.error(t('inventory.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  // Yangi mahsulot qo'shish uchun forma ochish
  const handleAddNew = () => {
    setEditingId(null)
    setFormData({
      product_id: '',
      stock_quantity: 0,
      price_30: 0,
      price_50: 0,
      price_100: 0,
      price_retail: 0
    })
    setShowForm(true)
  }

  // Mavjud mahsulotni tahrirlash
  const handleEdit = (item) => {
    setEditingId(item.product_id)
    setFormData({
      product_id: item.product_id,
      stock_quantity: item.stock_quantity || 0,
      price_30: item.price_30 || 0,
      price_50: item.price_50 || 0,
      price_100: item.price_100 || 0,
      price_retail: item.price_retail || 0
    })
    setShowForm(true)
  }

  // O'chirish
  const handleDelete = async (productId) => {
    const product = products.find(p => p.id === productId)
    if (!window.confirm(t('inventory.confirm_delete', { name: product?.name }))) {
      return
    }

    try {
      await inventoryService.delete(productId)
      alert(t('inventory.delete_success'))
      fetchData()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    }
  }

  // Saqlash (yaratish yoki yangilash)
  const handleSave = async () => {
    if (!formData.product_id) {
      alert(t('inventory.select_product_error'))
      return
    }

    try {
      await inventoryService.createOrUpdate(formData)
      alert(editingId ? t('inventory.updated_success') : t('inventory.created_success'))
      setShowForm(false)
      setEditingId(null)
      setFormData({
        product_id: '',
        stock_quantity: 0,
        price_30: 0,
        price_50: 0,
        price_100: 0,
        price_retail: 0
      })
      fetchData()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      product_id: '',
      stock_quantity: 0,
      price_30: 0,
      price_50: 0,
      price_100: 0,
      price_retail: 0
    })
  }

  // Jadval uchun ustunlar
  const columns = [
    { 
      header: t('inventory.no'), 
      accessor: 'product_id',
      render: (_, row, index) => index + 1
    },
    { 
      header: t('inventory.product'), 
      accessor: 'product_id',
      render: (value) => {
        const product = products.find(p => p.id === value)
        return <span className="font-bold text-gray-900">{product?.name || t('inventory.unknown')}</span>
      }
    },
    { 
      header: t('inventory.in_stock'), 
      accessor: 'stock_quantity',
      render: (value) => (
        <span className={`font-bold ${value > 10 ? 'text-green-600' : value > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
          {value} {t('inventory.units')}
        </span>
      )
    },
    { 
      header: t('inventory.wholesale_30'), 
      accessor: 'price_30',
      render: (value) => <span className="text-gray-600">{formatMoney(value)}</span>
    },
    { 
      header: t('inventory.wholesale_50'), 
      accessor: 'price_50',
      render: (value) => <span className="text-gray-600">{formatMoney(value)}</span>
    },
    { 
      header: t('inventory.wholesale_100'), 
      accessor: 'price_100',
      render: (value) => <span className="text-gray-600">{formatMoney(value)}</span>
    },
    { 
      header: t('inventory.retail'), 
      accessor: 'price_retail',
      render: (value) => <span className="text-gray-600">{formatMoney(value)}</span>
    },
    
    // ✅ 2-O'ZGARISH: "Amallar" ustuni faqat readOnly=false bo'lganda qo'shiladi
    ...(readOnly ? [] : [{
      header: t('inventory.actions'),
      accessor: 'product_id',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(row) }}
            className="text-blue-600 hover:text-blue-800 font-bold text-sm"
            title={t('buttons.edit')}
          >
            ✏️
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(value) }}
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
    return <Loading fullScreen text={t('inventory.loading')} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('inventory.title')}</h1>
          <p className="text-gray-500 mt-1">{t('inventory.subtitle', { count: inventory.length })}</p>
        </div>
        
        {/* ✅ 3-O'ZGARISH: "Yangi mahsulot qo'shish" tugmasi faqat readOnly=false bo'lganda ko'rsatiladi */}
        {!readOnly && (
          <Button onClick={handleAddNew} variant="primary">
            {t('inventory.add_new_product')}
          </Button>
        )}
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="md" className="border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">{t('inventory.total_products')}</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">{inventory.length} {t('inventory.units')}</h3>
        </Card>
        <Card padding="md" className="border-l-4 border-green-500">
          <p className="text-sm text-gray-500">{t('inventory.in_stock_count')}</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">
            {inventory.filter(i => i.stock_quantity > 0).length} {t('inventory.units')}
          </h3>
        </Card>
        <Card padding="md" className="border-l-4 border-red-500">
          <p className="text-sm text-gray-500">{t('inventory.out_of_stock_count')}</p>
          <h3 className="text-2xl font-bold text-red-600 mt-2">
            {inventory.filter(i => i.stock_quantity === 0).length} {t('inventory.units')}
          </h3>
        </Card>
      </div>

      {/* ✅ 4-O'ZGARISH: Modal forma faqat readOnly=false va showForm=true bo'lganda ko'rsatiladi */}
      {!readOnly && showForm && (
        <Modal 
          title={editingId ? t('inventory.edit_title') : t('inventory.add_title')} 
          onClose={handleCancel}
        >
          <div className="space-y-4">
            {!editingId && (
              <Select
                label={t('inventory.select_product')}
                value={formData.product_id}
                onChange={(e) => setFormData({...formData, product_id: parseInt(e.target.value)})}
                options={products
                  .filter(p => !inventory.find(i => i.product_id === p.id))
                  .map(p => ({ value: p.id, label: p.name }))}
                placeholder={t('inventory.select_product_placeholder')}
              />
            )}

            <Input
              label={t('inventory.stock_quantity')}
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0})}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('inventory.price_30')}
                type="number"
                value={formData.price_30}
                onChange={(e) => setFormData({...formData, price_30: parseFloat(e.target.value) || 0})}
              />
              <Input
                label={t('inventory.price_50')}
                type="number"
                value={formData.price_50}
                onChange={(e) => setFormData({...formData, price_50: parseFloat(e.target.value) || 0})}
              />
              <Input
                label={t('inventory.price_100')}
                type="number"
                value={formData.price_100}
                onChange={(e) => setFormData({...formData, price_100: parseFloat(e.target.value) || 0})}
              />
              <Input
                label={t('inventory.price_retail')}
                type="number"
                value={formData.price_retail}
                onChange={(e) => setFormData({...formData, price_retail: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} variant="success" className="flex-1">
                💾 {t('buttons.save')}
              </Button>
              <Button onClick={handleCancel} variant="secondary">
                {t('buttons.cancel')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Jadval */}
      <Card padding="none">
        <Table
          columns={columns}
          data={inventory}
          emptyMessage={t('inventory.empty_message')}
        />
      </Card>
    </div>
  )
}

export default InventoryList