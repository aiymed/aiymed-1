// frontend/src/components/admin/payments/PaymentDetail.jsx
import { useState, useEffect } from 'react'
import { orderService } from '../../../services/orderService'
import { formatDate, formatMoney } from '../../../utils/format'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next'

// ✅ 1-O'ZGARISH: readOnly prop qo'shildi (default qiymati false)
function PaymentDetail({ clientId, onBack, readOnly = false }) {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [clientId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await orderService.getClientPayments(clientId)
      setData(result)
    } catch (error) {
      console.error(t('paymentDetail.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  // To'lovni tahrirlash (readOnly=false bo'lganda ishlaydi)
  const handleEditPayment = async (payment) => {
    const newAmount = prompt(t('paymentDetail.prompt_new_amount'), payment.amount)
    if (!newAmount) return
    
    const newNote = prompt(t('paymentDetail.prompt_new_note'), payment.note || '')
    
    try {
      await orderService.updatePayment(payment.id, {
        amount: parseFloat(newAmount),
        note: newNote
      })
      alert(t('paymentDetail.update_success'))
      fetchData()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    }
  }

  // To'lovni o'chirish (readOnly=false bo'lganda ishlaydi)
  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm(t('paymentDetail.confirm_delete'))) return
    
    try {
      await orderService.deletePayment(paymentId)
      alert(t('paymentDetail.delete_success'))
      fetchData()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    }
  }

  if (loading) {
    return <Loading fullScreen text={t('paymentDetail.loading')} />
  }

  if (!data) {
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
          <h1 className="text-2xl font-bold text-gray-800">{data.client_name}</h1>
          <p className="text-gray-500 mt-1">
            {t('paymentDetail.inn')}: {data.client_inn || '-'} | {t('paymentDetail.region')}: {data.client_region || '-'}
          </p>
        </div>
        <Button onClick={onBack} variant="secondary">
          {t('buttons.back')}
        </Button>
      </div>

      {/* Moliyaviy holat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="md" className="border-l-4 border-red-500">
          <p className="text-sm text-gray-500 font-medium">📉 {t('paymentDetail.debtor_debt')}</p>
          <h3 className="text-2xl font-bold text-red-600 mt-2">{formatMoney(data.total_debt)}</h3>
          <p className="text-xs text-gray-500 mt-1">{t('paymentDetail.debtor_desc')}</p>
        </Card>

        <Card padding="md" className="border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">💳 {t('paymentDetail.total_payments')}</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">{formatMoney(data.total_paid)}</h3>
          <p className="text-xs text-gray-500 mt-1">{t('paymentDetail.total_payments_desc')}</p>
        </Card>

        <Card padding="md" className="border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">📊 {t('paymentDetail.total_orders')}</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">{formatMoney(data.total_expected)}</h3>
          <p className="text-xs text-gray-500 mt-1">{t('paymentDetail.total_orders_desc')}</p>
        </Card>
      </div>

      {/* To'lovlar tarixi */}
      <Card padding="md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📜 {t('paymentDetail.payment_history')}</h3>
        {data.payments && data.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('paymentDetail.date')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('paymentDetail.amount')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('paymentDetail.note')}</th>
                  
                  {/* ✅ 2-O'ZGARISH: "Amallar" sarlavhasi faqat readOnly=false bo'lganda ko'rsatiladi */}
                  {!readOnly && (
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('paymentDetail.actions')}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(payment.date)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">{formatMoney(payment.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payment.note || '-'}</td>
                    
                    {/* ✅ 3-O'ZGARISH: "Amallar" katakchasi va tugmalari faqat readOnly=false bo'lganda ko'rsatiladi */}
                    {!readOnly && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPayment(payment)}
                            className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                            title={t('buttons.edit')}
                          >
                            ✏️ {t('buttons.edit')}
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-800 font-bold text-sm"
                            title={t('buttons.delete')}
                          >
                           🗑 {t('buttons.delete')}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">{t('paymentDetail.no_payments')}</p>
        )}
      </Card>

      {/* Buyurtmalar va qoldiqlar */}
      <Card padding="md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📦 {t('paymentDetail.orders_and_remaining')}</h3>
        {data.orders && data.orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('paymentDetail.order_id')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('paymentDetail.date')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('paymentDetail.total_amount')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('paymentDetail.remaining_debt')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">#{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatMoney(order.total)}</td>
                    <td className={`px-4 py-3 text-sm font-bold ${order.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatMoney(order.remaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">{t('paymentDetail.no_orders')}</p>
        )}
      </Card>
    </div>
  )
}

export default PaymentDetail