// frontend/src/components/admin/orders/OrderList.jsx
import { useState, useEffect } from 'react'
import { orderService } from '../../../services/orderService'
import { formatDate, formatMoney } from '../../../utils/format'
import { ORDER_STATUS_BADGES } from '../../../utils/constants'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Badge from '../../common/Badge'
import Table from '../../common/Table'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next'

// ✅ 1-O'ZGARISH: readOnly, userRole va userRegion prop qo'shildi
function OrderList({ onNavigate, readOnly = false, userRole = 'admin', userRegion = '' }) {
  const { t } = useTranslation()
  
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    region: userRegion || '', // Sales uchun avtomatik hudud
    search: ''
  })

  // ✅ 2-O'ZGARISH: Faqat status yoki region o'zgarganda backend'dan so'rov yuboriladi.
  useEffect(() => {
    fetchOrders()
  }, [filters.status, filters.region])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await orderService.getAll({
        status: filters.status,
        region: filters.region
      })
      setOrders(data)
    } catch (error) {
      console.error(t('orders.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    let confirmMsg = ''
    if (newStatus === 'approved') confirmMsg = t('orders.confirm_approve')
    else if (newStatus === 'rejected') confirmMsg = t('orders.confirm_reject')
    else confirmMsg = t('orders.confirm_cancel')

    if (!window.confirm(confirmMsg)) {
      return
    }

    try {
      await orderService.updateStatus(orderId, newStatus)
      alert(t('common.success'))
      fetchOrders()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    }
  }

  // ✅ 3-O'ZGARISH: Admin uchun o'chirish funksiyasi
  const handleDelete = async (orderId) => {
    if (!window.confirm(t('orders.confirm_delete'))) {
      return
    }
    try {
      // DIQQAT: Agar bu yerda "API xatolik" (405 Method Not Allowed) chiqsa, 
      // backend faylingizda (masalan, orders.py) @router.delete("/{order_id}") qo'shish kerak.
      await orderService.deleteOrder(orderId) 
      alert(t('common.success'))
      fetchOrders()
    } catch (error) {
      // Agar backend'da delete yo'q bo'lsa, vaqtinchalik statusni 'deleted' ga o'zgartirish (fallback)
      // await orderService.updateStatus(orderId, 'deleted')
      alert(t('common.error') + ': ' + error.message)
    }
  }

  // ✅ 4-O'ZGARISH: SMART SEARCH (Mahalliy aqlli qidiruv)
  const displayOrders = orders.filter(order => {
    if (!filters.search) return true
    
    const searchLower = filters.search.toLowerCase().trim()
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0)
    
    const searchableText = [
      order.id?.toString(),
      order.client_name,
      order.client_inn,
      order.region
    ].filter(Boolean).join(' ').toLowerCase()
    
    return searchWords.every(word => searchableText.includes(word))
  })

  const columns = [
    { header: t('orders.id'), accessor: 'id', className: 'font-bold' },
    { 
      header: t('orders.client'), 
      accessor: 'client_name',
      render: (value, row) => (
        <div>
          <p className="font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">INN: {row.client_inn || '-'}</p>
        </div>
      )
    },
    { 
      header: t('orders.payment_type'), 
      accessor: 'payment_type',
      render: (value) => {
        const types = {
          'wholesale_30': { text: t('orders.type_30'), color: 'bg-blue-100 text-blue-800' },
          'wholesale_50': { text: t('orders.type_50'), color: 'bg-purple-100 text-purple-800' },
          'wholesale_100': { text: t('orders.type_100'), color: 'bg-green-100 text-green-800' },
          'retail': { text: t('orders.type_retail'), color: 'bg-orange-100 text-orange-800' }
        }
        const type = types[value] || { text: value, color: 'bg-gray-100 text-gray-800' }
        return <Badge {...type} size="xs" />
      }
    },
    { 
      header: t('orders.total'), 
      accessor: 'total_amount',
      render: (value) => <span className="font-bold text-green-600">{formatMoney(value)}</span>
    },
    { 
      header: t('orders.status'), 
      accessor: 'status',
      render: (value) => {
        const badge = ORDER_STATUS_BADGES[value] || ORDER_STATUS_BADGES.pending
        return (
          <Badge 
            text={t(`orderStatus.${value}`)}
            color={badge.color}
            size="xs"
          />
        )
      }
    },
    { 
      header: t('orders.date'), 
      accessor: 'created_at',
      render: (value) => formatDate(value)
    },
    
    // ✅ 5-O'ZGARISH: "Amallar" ustuni rolga va holatga qarab aniq sozlandi
    ...(readOnly ? [] : [{
      header: t('orders.actions'),
      accessor: 'id',
      render: (value, row) => (
        <div className="flex gap-2 flex-wrap">
          
          {/* 👑 ADMIN ACTIONS */}
          {userRole === 'admin' && row.status === 'pending' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'approved') }}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition flex items-center gap-1"
                title={t('orders.approve')}
              >
                ✅ {t('orders.approve')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'rejected') }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition flex items-center gap-1"
                title={t('orders.reject')}
              >
                ❌ {t('orders.reject')}
              </button>
            </>
          )}
          
          {userRole === 'admin' && row.status === 'approved' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'pending') }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition flex items-center gap-1"
              title={t('orders.cancel')}
            >
              🚫 {t('orders.cancel')}
            </button>
          )}
          
          {userRole === 'admin' && row.status === 'rejected' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'pending') }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium transition flex items-center gap-1"
              title={t('orders.reconsider')}
            >
              🔄 {t('orders.reconsider')}
            </button>
          )}
          
          {/* ✅ YANGI: Admin uchun cancelled holatda FAQAT o'chirish tugmasi qoldi (Tahrirlash yo'q) */}
          {userRole === 'admin' && row.status === 'cancelled' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(row.id) }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition flex items-center gap-1"
              title={t('buttons.delete')}
            >
              🗑️ {t('buttons.delete')}
            </button>
          )}

          {/* 💼 SALES ACTIONS (Faqat tahrirlash va bekor qilish) */}
          {userRole === 'sales' && row.status === 'pending' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onNavigate('edit-order', row.id) }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition flex items-center gap-1"
                title={t('buttons.edit')}
              >
                ✏️ {t('buttons.edit')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'cancelled') }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition flex items-center gap-1"
                title={t('orders.cancel')}
              >
                🚫 {t('orders.cancel')}
              </button>
            </>
          )}

          {/* ✅ YANGI: Sales uchun cancelled holatda hech qanday tugma yo'q (chunki uni faqat Admin o'chiradi) */}

        </div>
      )
    }])
  ]

  if (loading) {
    return <Loading fullScreen text={t('orders.loading')} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('orders.title')}</h1>
          <p className="text-gray-500 mt-1">
            {t('orders.subtitle', { count: displayOrders.length })}
            {filters.search && ` (Jami: ${orders.length} ta dan filtrlanmoqda)`}
          </p>
        </div>
        
        {!readOnly && (userRole === 'admin' || userRole === 'sales') && (
          <Button onClick={() => onNavigate('new-order')} variant="primary">
            {t('buttons.new_order')}
          </Button>
        )}
      </div>

      {/* Filtrlar */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('orders.filter_status')}</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('orders.status_all')}</option>
              <option value="pending">{t('orders.status_pending')}</option>
              <option value="approved">{t('orders.status_approved')}</option>
              <option value="rejected">{t('orders.status_rejected')}</option>
              <option value="cancelled">{t('orders.status_cancelled')}</option>
            </select>
          </div>

          {/* ✅ Smart Search input (Tugmasiz, avtomatik filtrlash) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('orders.filter_search')}</label>
            <input
              type="text"
              placeholder={t('orders.search_placeholder')}
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Jadval */}
      <Card padding="none">
        <Table
          columns={columns}
          data={displayOrders}
          onRowClick={(row) => onNavigate('order-detail', row.id)}
          emptyMessage={t('orders.no_orders')}
        />
      </Card>
    </div>
  )
}

export default OrderList