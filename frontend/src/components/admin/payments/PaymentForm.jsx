// frontend/src/components/admin/payments/PaymentForm.jsx
import { useState, useEffect } from 'react'
import { orderService } from '../../../services/orderService'
import { clientService } from '../../../services/clientService'
import { formatMoney } from '../../../utils/format'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Input from '../../common/Input'
import Select from '../../common/Select'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next' // ✅ Import qo'shildi

function PaymentForm({ onBack }) {
  const { t } = useTranslation() // ✅ Hook chaqirildi
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [clientData, setClientData] = useState(null) // ✅ Mijozning to'liq ma'lumotlari
  const [formData, setFormData] = useState({
    client_id: '',
    order_id: '',
    amount: '',
    note: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const data = await clientService.getAll()
      setClients(data)
    } catch (error) {
      console.error(t('paymentForm.fetch_error'), error)
    }
  }

  const handleClientChange = async (clientId) => {
    setFormData({ ...formData, client_id: clientId, order_id: '' })
    
    if (!clientId) {
      setClientData(null)
      return
    }

    try {
      // Backend'dan mijozning to'lov va buyurtma ma'lumotlarini olamiz
      const data = await orderService.getClientPayments(parseInt(clientId))
      setClientData(data)
      
      // ✅ MUHIM: Barcha tasdiqlangan buyurtmalarni ko'rsatamiz (remaining > 0 shartisiz)
      // Chunki 100% to'lovda remaining 0 bo'lishi mumkin, lekin pul hali kiritilmagan
      const approvedOrders = (data.orders || [])
      
      // Agar umuman buyurtma bo'lmasa, xabar beramiz (lekin alert bilan emas, UI orqali)
      if (approvedOrders.length === 0) {
        console.log(t('paymentForm.no_orders_log'))
      }
    } catch (error) {
      console.error(t('paymentForm.orders_fetch_error'), error)
      setClientData(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.client_id || !formData.amount) {
      alert(t('paymentForm.error_fill'))
      return
    }

    setLoading(true)
    try {
      const payload = {
        client_id: parseInt(formData.client_id),
        amount: parseFloat(formData.amount),
        note: formData.note
      }

      if (formData.order_id) {
        payload.order_id = parseInt(formData.order_id)
      }

      await orderService.addPayment(payload)
      alert(t('paymentForm.success'))
      onBack()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Yangi: Mijoz holati haqida chiroyli xabar
  const renderClientStatus = () => {
    if (!clientData) return null

    const debt = clientData.total_expected - clientData.total_paid
    
    if (clientData.orders && clientData.orders.length === 0) {
      return (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-blue-800 text-sm">
            ℹ️ {t('paymentForm.no_orders_info')}
          </p>
        </div>
      )
    }

    if (debt > 0) {
      return (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800 text-sm font-medium">
            ⚠️ {t('paymentForm.debt_warning', { amount: formatMoney(debt) })}
          </p>
          <p className="text-red-600 text-xs mt-1">
            {t('paymentForm.debt_details', { 
              expected: formatMoney(clientData.total_expected), 
              paid: formatMoney(clientData.total_paid) 
            })}
          </p>
        </div>
      )
    }

    if (debt < 0) {
      return (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-green-800 text-sm font-medium">
            ✅ {t('paymentForm.overpayment_success', { amount: formatMoney(Math.abs(debt)) })}
          </p>
        </div>
      )
    }

    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <p className="text-green-800 text-sm font-medium">
          ✅ {t('paymentForm.no_debt_success')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('paymentForm.title')}</h1>
          <p className="text-gray-500 mt-1">{t('paymentForm.subtitle')}</p>
        </div>
        <Button onClick={onBack} variant="secondary">
          {t('buttons.back')}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card padding="md">
          <div className="space-y-6">
            <Select
              label={t('paymentForm.client')}
              value={formData.client_id}
              onChange={(e) => handleClientChange(e.target.value)}
              options={clients.map(c => ({ 
                value: c.id, 
                label: `${c.name} (${c.region || t('paymentForm.no_region')})` 
              }))}
              placeholder={t('paymentForm.select_client')}
              required
            />

            {/* ✅ Mijoz holati haqida ma'lumot */}
            {formData.client_id && renderClientStatus()}

            {/* ✅ Barcha tasdiqlangan buyurtmalarni ko'rsatamiz */}
            {clientData && clientData.orders && clientData.orders.length > 0 && (
              <Select
                label={t('paymentForm.order_optional')}
                value={formData.order_id}
                onChange={(e) => setFormData({...formData, order_id: e.target.value})}
                options={clientData.orders.map(o => ({ 
                  value: o.id, 
                  label: t('paymentForm.order_label', { id: o.id, total: formatMoney(o.total) })
                }))}
                placeholder={t('paymentForm.general_payment')}
              />
            )}

            <Input
              label={t('paymentForm.amount')}
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder={t('paymentForm.amount_placeholder')}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('paymentForm.note')}</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                placeholder={t('paymentForm.note_placeholder')}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-4 mt-6">
          <Button type="submit" variant="success" disabled={loading} className="flex-1">
            {loading ? t('common.saving') : t('paymentForm.submit')}
          </Button>
          <Button type="button" onClick={onBack} variant="secondary">
            {t('buttons.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PaymentForm