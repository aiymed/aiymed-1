// frontend/src/components/admin/payments/PaymentList.jsx
import { useState, useEffect } from 'react'
import { orderService } from '../../../services/orderService'
import { formatMoney } from '../../../utils/format'
import { REGIONS } from '../../../utils/constants'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Badge from '../../common/Badge'
import Table from '../../common/Table'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next'

// ✅ 1-O'ZGARISH: readOnly va userRegion prop qo'shildi
function PaymentList({ onNavigate, readOnly = false, userRegion = '' }) {
  const { t } = useTranslation()
  const [clientsDebt, setClientsDebt] = useState([])
  const [loading, setLoading] = useState(true)
  
  // ✅ 2-O'ZGARISH: userRegion bo'lsa, dastlabki filtr shu hududga o'rnatiladi
  const [regionFilter, setRegionFilter] = useState(userRegion || '')

  // ✅ 3-O'ZGARISH: userRegion o'zgarganda regionFilter ni yangilash
  useEffect(() => {
    if (userRegion) {
      setRegionFilter(userRegion)
    }
  }, [userRegion])

  useEffect(() => {
    fetchClientsDebt()
  }, [regionFilter])

  const fetchClientsDebt = async () => {
    setLoading(true)
    try {
      const data = await orderService.getClientsDebt(regionFilter)
      setClientsDebt(data)
    } catch (error) {
      console.error(t('payments.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  const getClientStatus = (client) => {
    if (client.total_debt > 0) {
      return { 
        text: t('payments.debtor', { amount: formatMoney(client.total_debt) }), 
        color: 'bg-red-100 text-red-800'
      }
    } else if (client.overpayment > 0) {
      return { 
        text: t('payments.creditor', { amount: formatMoney(client.overpayment) }), 
        color: 'bg-green-100 text-green-800'
      }
    }
    return { text: t('payments.balanced'), color: 'bg-gray-100 text-gray-800' }
  }

  const columns = [
    { 
      header: t('payments.no'), 
      accessor: 'client_id',
      render: (_, row, index) => index + 1
    },
    { 
      header: t('payments.client'), 
      accessor: 'client_name',
      render: (value) => <span className="font-bold text-gray-900">{value}</span>
    },
    { 
      header: t('payments.region'), 
      accessor: 'region',
      render: (value) => value ? <Badge text={value} color="bg-blue-100 text-blue-800" size="xs" /> : <span className="text-gray-500">-</span>
    },
    { 
      header: t('payments.status'), 
      accessor: 'total_debt',
      render: (_, row) => {
        const status = getClientStatus(row)
        return <Badge {...status} size="xs" />
      }
    },
    { 
      header: t('payments.orders'), 
      accessor: 'orders_count',
      render: (value) => <span className="text-gray-600">{value || 0} ta</span>
    }
  ]

  if (loading) {
    return <Loading fullScreen text={t('payments.loading')} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('payments.title')}</h1>
          <p className="text-gray-500 mt-1">
            {userRegion ? `${t('payments.subtitle')} - ${t(`regions.${userRegion}`)}` : t('payments.subtitle')}
          </p>
        </div>
        
        {/* ✅ "Yangi to'lov qo'shish" tugmasi faqat readOnly=false bo'lganda ko'rsatiladi */}
        {!readOnly && (
          <Button onClick={() => onNavigate('new-payment')} variant="primary">
            {t('buttons.add_payment')}
          </Button>
        )}
      </div>

      {/* Filtr */}
      <Card padding="md">
        <div className="flex items-center gap-4">
          <label className="font-bold text-gray-700">{t('payments.filter_region')}</label>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            // ✅ 4-O'ZGARISH: Agar userRegion bo'lsa, select qulflanadi
            disabled={!!userRegion}
            className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              userRegion ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
            }`}
          >
            {userRegion ? (
              // Sales uchun faqat o'z hududi
              <option value={userRegion}>{t(`regions.${userRegion}`)}</option>
            ) : (
              // Admin uchun barcha hududlar
              <>
                <option value="">{t('payments.all_regions')}</option>
                {REGIONS.map(region => (
                  <option key={region} value={region}>{t(`regions.${region}`)}</option>
                ))}
              </>
            )}
          </select>
        </div>
      </Card>

      {/* Statistika */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="md" className="border-l-4 border-red-500">
          <p className="text-sm text-gray-500">{t('payments.total_debtor')}</p>
          <h3 className="text-2xl font-bold text-red-600 mt-2">
            {formatMoney(clientsDebt.reduce((sum, c) => sum + (c.total_debt || 0), 0))}
          </h3>
        </Card>

        <Card padding="md" className="border-l-4 border-green-500">
          <p className="text-sm text-gray-500">{t('payments.total_creditor')}</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">
            {formatMoney(clientsDebt.reduce((sum, c) => sum + (c.overpayment || 0), 0))}
          </h3>
        </Card>

        <Card padding="md" className="border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">{t('payments.total_clients')}</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">
            {clientsDebt.length} ta
          </h3>
        </Card>
      </div>

      {/* Jadval */}
      <Card padding="none">
        <Table
          columns={columns}
          data={clientsDebt}
          onRowClick={(row) => onNavigate('payment-detail', row.client_id)}
          emptyMessage={t('payments.no_clients')}
        />
      </Card>
    </div>
  )
}

export default PaymentList