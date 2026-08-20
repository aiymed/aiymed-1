// frontend/src/components/admin/orders/OrderForm.jsx
import { useState, useEffect, useRef } from 'react'
import { orderService } from '../../../services/orderService'
import { clientService } from '../../../services/clientService'
import { productService } from '../../../services/productService'
import { inventoryService } from '../../../services/inventoryService'
import { calculateVAT, calculatePrepayment, calculateRemaining } from '../../../utils/helpers'
import { formatMoney } from '../../../utils/format'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Input from '../../common/Input'
import Select from '../../common/Select'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next'

// ✅ 1-O'ZGARISH: isSales va userRole prop qo'shildi
function OrderForm({ onBack, editingOrderId, isSales = false, userRole = 'admin', userRegion = '' }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [inventoryData, setInventoryData] = useState([])
  
  // ✅ 2-O'ZGARISH: Mijoz qidiruvi uchun yangi state'lar
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const clientDropdownRef = useRef(null)

  const [formData, setFormData] = useState({
    client_id: '',
    payment_type: 'wholesale_50',
    items: []
  })
  
  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 1,
    price: 0,
    product_name: '',
    unit: 'dona'
  })

  useEffect(() => {
    fetchData()
    if (editingOrderId) {
      loadOrderData()
    }
    
    // ✅ 3-O'ZGARISH: Tashqariga bosilganda dropdown'ni yopish
    const handleClickOutside = (event) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
        setShowClientDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchData = async () => {
    try {
      const [clientsData, productsData, invData] = await Promise.all([
        clientService.getAll(),
        productService.getAll(),
        inventoryService.getAll()
      ])
      setClients(clientsData)
      setProducts(productsData)
      setInventoryData(invData)
    } catch (error) {
      console.error(t('alerts.fetch_error'), error)
    }
  }

  const loadOrderData = async () => {
    setLoading(true)
    try {
      const order = await orderService.getById(editingOrderId)
      
      let safePaymentType = order.payment_type
      if ((isSales || userRole === 'sales') && order.payment_type === 'retail') {
        safePaymentType = 'wholesale_50'
      }

      setFormData({
        client_id: order.client_id,
        payment_type: safePaymentType,
        items: order.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product_name: item.product_name,
          unit: item.unit,
          total: item.total
        }))
      })
      
      // ✅ 4-O'ZGARISH (TUZATILDI): Tahrirlashda tanlangan mijoz nomini qidiruv maydoniga qo'yish
      // clientsData o'rniga to'g'ridan-to'g'ri clients state'i ishlatildi
      const selectedClient = clients?.find(c => c.id === order.client_id)
      if (selectedClient) {
        setClientSearch(`${selectedClient.name} (INN: ${selectedClient.inn})`)
      }
    } catch (error) {
      console.error(t('alerts.load_error_log'), error)
      alert(t('alerts.load_error'))
    } finally {
      setLoading(false)
    }
  }

  // ✅ 5-O'ZGARISH: AQILLI QIDIRUV (Smart Search) logikasi
  const filteredClients = clients.filter(client => {
    if (!clientSearch) return true
    
    const searchLower = clientSearch.toLowerCase().trim()
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0)
    
    const searchableText = [
      client.name,
      client.inn,
      client.contract_number,
      client.region,
      client.phone
    ].filter(Boolean).join(' ').toLowerCase()
    
    return searchWords.every(word => searchableText.includes(word))
  })

  // ✅ 6-O'ZGARISH: Mijoz tanlanganda
  const handleClientSelect = (client) => {
    setFormData({ ...formData, client_id: client.id })
    setClientSearch(`${client.name} (INN: ${client.inn})`)
    setShowClientDropdown(false)
  }

    const handleProductSelect = (productId) => {
    if (!productId) {
      setNewItem({ product_id: '', quantity: 1, price: 0, product_name: '', unit: '' })
      return
    }

    const product = products.find(p => p.id === parseInt(productId))
    if (!product) return

    const inv = inventoryData.find(i => i.product_id === product.id)
    
    if (!inv || !inv.price_50) {
      alert(t('alerts.no_price', { name: product.name }))
      setNewItem({ product_id: '', quantity: 1, price: 0, product_name: '', unit: '' })
      return
    }

    let price = 0
    if (formData.payment_type === 'wholesale_30') {
      price = inv.price_30
    } else if (formData.payment_type === 'wholesale_100') {
      price = inv.price_100
    } else {
      price = inv.price_50  // ✅ Default wholesale_50
    }

    setNewItem({
      product_id: product.id,
      quantity: 1,
      price: price,
      product_name: product.name,
      unit: product.unit || ''
    })
  }

  const handlePaymentTypeChange = (newType) => {
    setFormData({ ...formData, payment_type: newType })
    
    if (newItem.product_id) {
      const inv = inventoryData.find(i => i.product_id === newItem.product_id)
      if (inv) {
        let newPrice = 0
        if (newType === 'wholesale_30') newPrice = inv.price_30
        else if (newType === 'wholesale_100') newPrice = inv.price_100
        else newPrice = inv.price_50  // ✅ Default wholesale_50
        
        setNewItem({ ...newItem, price: newPrice })
      }
    }
  }

  const addItem = () => {
    if (!newItem.product_id || newItem.quantity < 1) {
      alert(t('alerts.select_product_quantity'))
      return
    }

    const existingItem = formData.items.find(item => item.product_id === newItem.product_id)
    if (existingItem) {
      alert(t('alerts.product_already_added'))
      return
    }

    setFormData({
      ...formData,
      items: [...formData.items, { ...newItem, id: Date.now() }]
    })
    setNewItem({ product_id: '', quantity: 1, price: 0, product_name: '', unit: '' })
  }

  const removeItem = (id) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id)
    })
  }

  const calculateTotals = () => {
    const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const vat = calculateVAT(total)
    const prepayment = calculatePrepayment(total, formData.payment_type)
    const remaining = calculateRemaining(total, formData.payment_type)
    
    return { total, vat, prepayment, remaining }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.client_id) {
      alert(t('alerts.select_client'))
      return
    }
    if (formData.items.length === 0) {
      alert(t('alerts.add_at_least_one_product'))
      return
    }

    setLoading(true)
    try {
      const currentUserStr = localStorage.getItem('user')
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null
      const userId = currentUser ? currentUser.id : 1

      const payload = {
        client_id: parseInt(formData.client_id),
        user_id: userId,
        payment_type: formData.payment_type,
        items: formData.items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity)
        }))
      }

      if (editingOrderId) {
        await orderService.update(editingOrderId, payload)
        alert(t('alerts.updated_success'))
        // ✅ YANGI: Muvaffaqiyatli yangilangandan keyin onBack() chaqirish
        onBack()
      } else {
        await orderService.create(payload)
        alert(t('alerts.created_success'))
        onBack()
      }
    } catch (error) {
      console.error(t('alerts.create_error_log'), error)
      alert(t('common.error') + ': ' + (error.message || t('common.unknown_error')))
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

    const isSalesUser = isSales || userRole === 'sales'
  
  // ✅ Sales uchun faqat ulgurji turlari, retail mutlaqo yo'q
  const paymentTypeOptions = isSalesUser 
    ? [
        { value: 'wholesale_30', label: t('orderForm.wholesale_30') },
        { value: 'wholesale_50', label: t('orderForm.wholesale_50') },
        { value: 'wholesale_100', label: t('orderForm.wholesale_100') }
      ]
    : [
        { value: 'wholesale_30', label: t('orderForm.wholesale_30') },
        { value: 'wholesale_50', label: t('orderForm.wholesale_50') },
        { value: 'wholesale_100', label: t('orderForm.wholesale_100') },
        { value: 'retail', label: t('orderForm.retail') }
      ]
  
  if (!isSalesUser) {
    paymentTypeOptions.push({ value: 'retail', label: t('orderForm.retail') })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {editingOrderId ? t('orderForm.edit_title') : t('orderForm.create_title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {editingOrderId ? t('orderForm.edit_subtitle') : t('orderForm.create_subtitle')}
          </p>
        </div>
        <Button onClick={onBack} variant="secondary">
          {t('buttons.back')}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Asosiy ma'lumotlar */}
        <Card padding="md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* ✅ 7-O'ZGARISH: AQILLI QIDIRUVLI MIJOZ TANLASH */}
            <div className="relative" ref={clientDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('orderForm.client')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value)
                  setShowClientDropdown(true)
                  // Agar qidiruv o'zgarsa, client_id ni tozalash
                  setFormData({ ...formData, client_id: '' })
                }}
                onFocus={() => setShowClientDropdown(true)}
                placeholder={t('orderForm.select_client')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
              {/* Dropdown ro'yxat */}
              {showClientDropdown && filteredClients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredClients.map(client => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleClientSelect(client)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition"
                    >
                      <div className="font-bold text-gray-900">{client.name}</div>
                      <div className="text-xs text-gray-500">
                        INN: {client.inn} {client.region && `| ${client.region}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {showClientDropdown && clientSearch && filteredClients.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                  {t('clients.no_clients')}
                </div>
              )}
            </div>

            <Select
              label={t('orderForm.payment_type')}
              value={formData.payment_type}
              onChange={(e) => handlePaymentTypeChange(e.target.value)}
              options={paymentTypeOptions}
              required
            />
          </div>
        </Card>

        {/* Mahsulotlar */}
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('orderForm.add_products')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select
              label={t('orderForm.product')}
              value={newItem.product_id}
              onChange={(e) => handleProductSelect(e.target.value)}
              options={products.map(p => {
                const inv = inventoryData.find(i => i.product_id === p.id)
                let displayPrice = 0
                if (inv) {
                  if (formData.payment_type === 'wholesale_30') displayPrice = inv.price_30
                  else if (formData.payment_type === 'wholesale_100') displayPrice = inv.price_100
                  else if (formData.payment_type === 'retail') displayPrice = inv.price_retail || inv.price_50
                  else displayPrice = inv.price_50
                }
                
                return {
                  value: p.id,
                  label: displayPrice > 0 ? `${p.name} (${formatMoney(displayPrice)})` : `${p.name} (${t('orderForm.no_price_set')})`
                }
              })}
              placeholder={t('orderForm.select_product')}
            />

            <Input
              label={t('orderForm.quantity')}
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
              min="1"
            />

            <div className="flex items-end">
              <Button type="button" onClick={addItem} variant="success" className="w-full">
                {t('buttons.add')}
              </Button>
            </div>
          </div>

          {/* Tanlangan mahsulotlar */}
          {formData.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('orderForm.no')}</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('orderForm.product')}</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('orderForm.quantity')}</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('orderForm.price')}</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('orderForm.total')}</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-bold">{item.product_name}</td>
                      <td className="px-4 py-3 text-sm">{item.quantity} {item.unit}</td>
                      <td className="px-4 py-3 text-sm">{formatMoney(item.price)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">
                        {formatMoney(item.quantity * item.price)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 font-bold"
                          title={t('buttons.delete')}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Hisob-kitob */}
        {formData.items.length > 0 && (
          <Card padding="md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('orderForm.calculation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderForm.total_amount')}</span>
                  <span className="font-bold">{formatMoney(totals.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderForm.vat')}</span>
                  <span className="text-gray-700">{formatMoney(totals.vat)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">{t('orderForm.prepayment')}</span>
                  <span className="font-bold text-green-600">{formatMoney(totals.prepayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderForm.remaining_debt')}</span>
                  <span className="font-bold text-red-600">{formatMoney(totals.remaining)}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tugmalar */}
        <div className="flex gap-4">
          <Button type="submit" variant="primary" disabled={loading} className="flex-1">
            {loading ? t('common.saving') : (editingOrderId ? t('buttons.update') : t('buttons.create'))}
          </Button>
          <Button type="button" onClick={onBack} variant="secondary">
            {t('buttons.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default OrderForm