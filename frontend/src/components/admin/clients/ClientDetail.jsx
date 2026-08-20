// frontend/src/components/admin/clients/ClientDetail.jsx
import { useState, useEffect } from 'react'
import { clientService } from '../../../services/clientService'
import { orderService } from '../../../services/orderService'
import { formatDate, formatMoney } from '../../../utils/format'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Badge from '../../common/Badge'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next'

// ✅ 1-O'ZGARISH: readOnly prop qo'shildi (default qiymati false)
function ClientDetail({ clientId, onBack, onEdit, readOnly = false }) {
  const { t } = useTranslation()
  const [client, setClient] = useState(null)
  const [orders, setOrders] = useState([])
  const [payments, setPayments] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClientData()
  }, [clientId])

  const fetchClientData = async () => {
    setLoading(true)
    try {
      const [clientData, paymentsData] = await Promise.all([
        clientService.getById(clientId),
        orderService.getClientPayments(clientId)
      ])
      
      setClient(clientData)
      setPayments(paymentsData)
      
      // Mijozning buyurtmalarini olish (agar backend'da bo'lsa)
      if (paymentsData.orders) {
        setOrders(paymentsData.orders)
      }
    } catch (error) {
      console.error(t('clientDetail.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading fullScreen text={t('clientDetail.loading')} />
  }

  if (!client) {
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
          <h1 className="text-2xl font-bold text-gray-800">{client.name}</h1>
          <p className="text-gray-500 mt-1">
            {t('clientDetail.inn')}: {client.inn || '-'} | {client.region || t('clientDetail.no_region')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onBack} variant="secondary">{t('buttons.back')}</Button>
          
          {/* ✅ 2-O'ZGARISH: "Tahrirlash" tugmasi faqat readOnly=false bo'lganda ko'rsatiladi */}
          {!readOnly && (
            <Button onClick={() => onEdit(clientId)} variant="warning">
              ✏️ {t('buttons.edit')}
            </Button>
          )}
        </div>
      </div>

      {/* Mijoz ma'lumotlari */}
      <Card padding="md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('clientDetail.client_info')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t('clientDetail.name')}</p>
            <p className="font-bold text-gray-900">{client.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('clientDetail.inn')}</p>
            <p className="font-bold text-gray-900">{client.inn || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('clientDetail.contract_number')}</p>
            <p className="font-bold text-gray-900">{client.contract_number || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('clientDetail.region')}</p>
            <p className="font-bold text-gray-900">{client.region || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('clientDetail.phone')}</p>
            <p className="font-bold text-gray-900">{client.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('clientDetail.email')}</p>
            <p className="font-bold text-gray-900">{client.email || '-'}</p>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-sm text-gray-500">{t('clientDetail.address')}</p>
            <p className="font-bold text-gray-900">{client.address || '-'}</p>
          </div>
        </div>
      </Card>

      {/* Moliyaviy holat */}
      {payments && (
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('clientDetail.financial_status')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
              <p className="text-sm text-gray-600 font-bold">{t('clientDetail.debtor_debt')}</p>
              <p className="text-2xl font-bold text-red-600">{formatMoney(payments.total_debt)}</p>
              <p className="text-xs text-gray-500 mt-1">{t('clientDetail.debtor_desc')}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <p className="text-sm text-gray-600 font-bold">{t('clientDetail.total_payments')}</p>
              <p className="text-2xl font-bold text-green-600">{formatMoney(payments.total_paid)}</p>
              <p className="text-xs text-gray-500 mt-1">{t('clientDetail.total_payments_desc')}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-gray-600 font-bold">{t('clientDetail.total_expected')}</p>
              <p className="text-2xl font-bold text-blue-600">{formatMoney(payments.total_expected)}</p>
              <p className="text-xs text-gray-500 mt-1">{t('clientDetail.total_expected_desc')}</p>
            </div>
          </div>
        </Card>
      )}

      {/* To'lovlar tarixi */}
      {payments && payments.payments && payments.payments.length > 0 && (
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('clientDetail.payment_history')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('clientDetail.date')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('clientDetail.amount')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('clientDetail.note')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(payment.date)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">{formatMoney(payment.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payment.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Buyurtmalar */}
      {orders.length > 0 && (
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('clientDetail.orders_and_remaining')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('clientDetail.order_id')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('clientDetail.date')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('clientDetail.total_amount')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('clientDetail.remaining_debt')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map(order => (
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
        </Card>
      )}
    </div>
  )
}

export default ClientDetail