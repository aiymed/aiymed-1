// frontend/src/components/admin/orders/OrderDetail.jsx
import { useState, useEffect } from 'react'
import { orderService } from '../../../services/orderService'
import { formatDate, formatMoney } from '../../../utils/format'
import { ORDER_STATUS_BADGES } from '../../../utils/constants'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Badge from '../../common/Badge'
import Loading from '../../common/Loading'
import Modal from '../../common/Modal'
import html2canvas from 'html2canvas'
import { useTranslation } from 'react-i18next'

// ✅ 1-O'ZGARISH: readOnly va userRole prop qo'shildi
function OrderDetail({ orderId, onBack, onEdit, onStatusChange, readOnly = false, userRole = 'admin' }) {
  const { t } = useTranslation()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSpecification, setShowSpecification] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const data = await orderService.getById(orderId)
      setOrder(data)
    } catch (error) {
      console.error(t('orderDetail.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    let actionKey = ''
    let successKey = ''
    
    if (newStatus === 'approved') { actionKey = 'confirm_approve'; successKey = 'approved_success' }
    else if (newStatus === 'rejected') { actionKey = 'confirm_reject'; successKey = 'rejected_success' }
    else if (newStatus === 'pending') { actionKey = 'confirm_revert'; successKey = 'reverted_success' }
    else { actionKey = 'confirm_cancel'; successKey = 'cancelled_success' }
    
    if (!window.confirm(t(`orderDetail.${actionKey}`))) return

    try {
      await orderService.updateStatus(orderId, newStatus)
      alert(t(`orderDetail.${successKey}`))
      if (onStatusChange) onStatusChange()
      fetchOrder()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    }
  }

  const handleDownloadSpecification = async () => {
    const element = document.getElementById('specification-content')
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `Spetsifikatsiya_Buyurtma_${order.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error(t('orderDetail.download_error_log'), error)
      alert(t('orderDetail.download_error'))
    }
  }

  if (loading) {
    return <Loading fullScreen text={t('orderDetail.loading')} />
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t('orderDetail.not_found')}</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          {t('buttons.back')}
        </Button>
      </div>
    )
  }

  const statusBadge = ORDER_STATUS_BADGES[order.status] || ORDER_STATUS_BADGES.pending
  
  const getPaymentTypeText = (type) => {
    switch(type) {
      case 'wholesale_30': return t('orderDetail.type_30')
      case 'wholesale_50': return t('orderDetail.type_50')
      case 'wholesale_100': return t('orderDetail.type_100')
      case 'retail': return t('orderDetail.type_retail')
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('orderDetail.title', { id: order.id })}</h1>
          <p className="text-gray-500 mt-1">
            {formatDate(order.created_at)} | {getPaymentTypeText(order.payment_type)}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onBack} variant="secondary">{t('buttons.back')}</Button>
          <Button onClick={() => setShowSpecification(true)} variant="outline">
            📄 {t('orderDetail.specification')}
          </Button>
          
          {/* ✅ Tahrirlash tugmasi (Admin va Sales uchun pending/cancelled holatda) */}
          {!readOnly && (order.status === 'pending' || order.status === 'cancelled') && (
            <Button onClick={() => onEdit(orderId)} variant="warning">✏️ {t('buttons.edit')}</Button>
          )}
        </div>
      </div>

      {/* Mijoz ma'lumotlari */}
      <Card padding="md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🏥 {t('orderDetail.client_info')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t('orderDetail.client_name')}</p>
            <p className="font-bold text-gray-900">{order.client_name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('orderDetail.inn')}</p>
            <p className="font-bold text-gray-900">{order.client_inn || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('orderDetail.status')}</p>
            <Badge 
              text={t(`orderStatus.${order.status}`)}
              color={statusBadge.color}
              icon={statusBadge.icon}
              size="sm" 
            />
          </div>
        </div>
      </Card>

      {/* Mahsulotlar */}
      <Card padding="md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📦 {t('orderDetail.products_list')}</h3>
        {order.items && order.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('orderDetail.no')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('orderDetail.product')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('orderDetail.quantity')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('orderDetail.price')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('orderDetail.total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-bold">{item.product_name}</td>
                    <td className="px-4 py-3 text-sm">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-sm">{formatMoney(item.price)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">{formatMoney(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">{t('orderDetail.no_products')}</p>
        )}
      </Card>

      {/* Hisob-kitob */}
      <Card padding="md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">💰 {t('orderDetail.calculation')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">{t('orderDetail.total_amount')}:</span>
              <span className="font-bold text-gray-900">{formatMoney(order.total_amount)}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">{t('orderDetail.vat')}:</span>
              <span className="text-gray-700">{formatMoney(order.vat_amount)}</span>
            </div>
            <div className="flex justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-600">{t('orderDetail.prepayment')}:</span>
              <span className="font-bold text-green-600">{formatMoney(order.prepayment_amount)}</span>
            </div>
            <div className="flex justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-gray-600">{t('orderDetail.remaining_debt')}:</span>
              <span className="font-bold text-red-600">{formatMoney(order.remaining_amount)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ✅ 2-O'ZGARISH: ADMIN uchun status boshqaruvi panellari */}
      {!readOnly && userRole === 'admin' && order.status === 'pending' && (
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ {t('orderDetail.change_status')}</h3>
          <div className="flex gap-3">
            <Button onClick={() => handleStatusChange('approved')} variant="success">
              ✅ {t('orderDetail.approve')}
            </Button>
            <Button onClick={() => handleStatusChange('rejected')} variant="danger">
              ❌ {t('orderDetail.reject')}
            </Button>
          </div>
        </Card>
      )}

      {!readOnly && userRole === 'admin' && order.status === 'approved' && (
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ {t('orderDetail.change_status')}</h3>
          <div className="flex gap-3">
            <Button onClick={() => handleStatusChange('pending')} variant="secondary">
              🚫 {t('orderDetail.revert_to_pending')}
            </Button>
            <Button onClick={() => onEdit(orderId)} variant="warning">
              ✏️ {t('buttons.edit')}
            </Button>
          </div>
        </Card>
      )}

      {!readOnly && userRole === 'admin' && order.status === 'rejected' && (
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ {t('orderDetail.change_status')}</h3>
          <div className="flex gap-3">
            <Button onClick={() => handleStatusChange('pending')} variant="warning">
              🔄 {t('orderDetail.reconsider')}
            </Button>
          </div>
        </Card>
      )}

      {!readOnly && userRole === 'admin' && order.status === 'cancelled' && (
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ {t('orderDetail.change_status')}</h3>
          <div className="flex gap-3">
            <Button onClick={() => onEdit(orderId)} variant="warning">
              ✏️ {t('buttons.edit')}
            </Button>
          </div>
        </Card>
      )}

      {/* ✅ 3-O'ZGARISH: SALES uchun status boshqaruvi panellari (Faqat Tahrirlash va Bekor qilish) */}
      {!readOnly && userRole === 'sales' && order.status === 'pending' && (
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ {t('orderDetail.my_actions')}</h3>
          <div className="flex gap-3">
            <Button onClick={() => onEdit(orderId)} variant="warning">
              ✏️ {t('buttons.edit')}
            </Button>
            <Button onClick={() => handleStatusChange('cancelled')} variant="secondary">
              🚫 {t('orderDetail.cancel_order')}
            </Button>
          </div>
        </Card>
      )}

      {!readOnly && userRole === 'sales' && order.status === 'cancelled' && (
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ {t('orderDetail.my_actions')}</h3>
          <div className="flex gap-3">
            <Button onClick={() => onEdit(orderId)} variant="warning">
              ✏️ {t('buttons.edit')}
            </Button>
          </div>
        </Card>
      )}
  
      {/* ✅ SPETSIFIKATSIYA MODAL (O'zgarishsiz qoladi) */}
      {showSpecification && (
        <Modal 
          title={`📄 ${t('orderDetail.specification')}`}
          onClose={() => setShowSpecification(false)}
          className="max-w-3xl"
        >
          <div className="p-6 bg-white" id="specification-content">
            
            {/* HEADER */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-300">
              <div className="flex-shrink-0">
                <img src="/logo.png" alt="AIYMAN Logo" className="h-16 w-auto" />
              </div>
              <div className="flex-1 text-center px-4">
                <h2 className="text-xl font-bold text-gray-800 tracking-wide">AIYMAN</h2>
                <p className="text-sm text-gray-600 mt-1">{t('orderDetail.spec_order_id')}</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">#{order.id}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-gray-600">{t('orderDetail.spec_date')}</p>
                <p className="font-bold text-gray-900 text-sm mt-1">{formatDate(order.created_at)}</p>
              </div>
            </div>

            {/* KOMPANIYA MA'LUMOTLARI */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">{t('orderDetail.spec_company_info')}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-600">{t('orderDetail.spec_org_name')}</p>
                  <p className="font-bold text-gray-900">ИП ООО "AIYMAN"</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">{t('orderDetail.inn')}</p>
                  <p className="font-bold text-gray-900">310035378</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">{t('orderDetail.spec_mfo')}</p>
                  <p className="font-bold text-gray-900">01071</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">{t('orderDetail.spec_address')}</p>
                  <p className="font-bold text-gray-900 text-xs">Toshkent shahar, Mirobod tumani, Baynalminal MFY, Nukus k-si, 85-uy</p>
                </div>
              </div>
            </div>

            {/* MIJOZ MA'LUMOTLARI */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
              <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">{t('orderDetail.spec_client_info')}</h3>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-600">{t('orderDetail.client_name')}</p>
                  <p className="font-bold text-gray-900">{order.client_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">{t('orderDetail.inn')}</p>
                  <p className="font-bold text-gray-900">{order.client_inn || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">{t('orderDetail.region')}</p>
                  <p className="font-bold text-gray-900">{order.client_region || '-'}</p>
                </div>
              </div>
            </div>

            {/* TO'LOV TURI */}
            <div className="mb-6 text-center">
              <p className="text-xs text-gray-600 mb-1">{t('orderDetail.spec_type')}</p>
              <p className="font-bold text-blue-600 text-base">{getPaymentTypeText(order.payment_type)}</p>
            </div>

            {/* MAHSULOTLAR JADVALI */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">{t('orderDetail.spec_products')}</h3>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-400 px-3 py-2 text-left font-bold">{t('orderDetail.no')}</th>
                    <th className="border border-gray-400 px-3 py-2 text-left font-bold">{t('orderDetail.spec_product_name')}</th>
                    <th className="border border-gray-400 px-3 py-2 text-right font-bold">{t('orderDetail.quantity')}</th>
                    <th className="border border-gray-400 px-3 py-2 text-right font-bold">{t('orderDetail.spec_price_sum')}</th>
                    <th className="border border-gray-400 px-3 py-2 text-right font-bold">{t('orderDetail.spec_total_sum')}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                      <td className="border border-gray-300 px-3 py-2 font-medium">{item.product_name}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{item.quantity} {item.unit}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{formatMoney(item.price)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-bold text-green-700">
                        {formatMoney(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* HISOB-KITOB */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border-2 border-blue-300 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 text-base uppercase tracking-wide">💰 {t('orderDetail.calculation')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-gray-700 font-medium">{t('orderDetail.total_amount')}:</span>
                  <span className="font-bold text-gray-900 text-base">{formatMoney(order.total_amount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-gray-700 font-medium">{t('orderDetail.vat')}:</span>
                  <span className="text-gray-700">{formatMoney(order.vat_amount)}</span>
                </div>
                <div className="flex justify-between py-3 bg-blue-200 px-4 rounded mt-3">
                  <span className="font-bold text-blue-900">
                    {order.payment_type === 'retail' ? t('orderDetail.spec_full_payment') : t('orderDetail.spec_prepayment')}
                  </span>
                  <span className="font-bold text-blue-900 text-lg">{formatMoney(order.prepayment_amount)}</span>
                </div>
                {order.payment_type !== 'retail' && order.remaining_amount > 0 && (
                  <div className="flex justify-between py-2 text-red-700">
                    <span className="font-medium">{t('orderDetail.remaining_debt')}:</span>
                    <span className="font-bold">{formatMoney(order.remaining_amount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-6 pt-4 border-t-2 border-gray-300 text-center text-xs text-gray-600">
              <p className="font-medium">{t('orderDetail.spec_footer_auto')}</p>
              <p className="mt-1">{t('orderDetail.spec_footer_contact')}</p>
              <p className="mt-1 text-gray-500">{t('orderDetail.spec_footer_address')}</p>
            </div>

            {/* TUGMALAR */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
              <p className="text-xs text-gray-500">{t('orderDetail.spec_download_hint')}</p>
              <div className="flex gap-3">
                <Button onClick={() => setShowSpecification(false)} variant="secondary">
                  {t('buttons.close')}
                </Button>
                <Button onClick={handleDownloadSpecification} variant="primary">
                  📥 {t('buttons.download_png')}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default OrderDetail