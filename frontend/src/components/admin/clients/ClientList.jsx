// frontend/src/components/admin/clients/ClientList.jsx
import { useState, useEffect } from 'react'
import { clientService } from '../../../services/clientService'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Badge from '../../common/Badge'
import Table from '../../common/Table'
import Loading from '../../common/Loading'
import { REGIONS } from '../../../utils/constants'
import { useTranslation } from 'react-i18next'

function ClientList({ onNavigate, readOnly = false, userRegion = '' }) {
  const { t } = useTranslation()
  
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  
  // ✅ Boshlang'ich qiymat: userRegion bo'lsa, shu hududga o'rnatiladi
  const [filters, setFilters] = useState({
    region: userRegion || '',
    search: ''
  })

  // ✅ userRegion o'zgarganda filters.region ni yangilash
  useEffect(() => {
    if (userRegion) {
      setFilters(prev => ({
        ...prev,
        region: userRegion
      }))
    }
  }, [userRegion])

  // ✅ Faqat filters.region o'zgarganda backend'dan so'rov yuboriladi
  useEffect(() => {
    fetchClients()
  }, [filters.region])

  const fetchClients = async () => {
    setLoading(true)
    try {
      // ✅ Backend'ga region parametri yuboriladi
      const data = await clientService.getAll(filters.region)
      setClients(data)
    } catch (error) {
      console.error(t('clients.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (clientId, clientName) => {
    if (!window.confirm(t('clients.confirm_delete', { name: clientName }))) {
      return
    }

    try {
      await clientService.delete(clientId)
      alert(t('clients.deleted_success'))
      fetchClients()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    }
  }

  // ✅ ASOSIY FILTRATSIYA - Sales uchun faqat o'z hududi
  const filteredClients = clients.filter(client => {
    // Sales uchun: Faqat o'z hududi (qat'iy filtr)
    if (userRegion && client.region !== userRegion) {
      return false
    }
    
    // Admin uchun: Tanlangan region
    if (!userRegion && filters.region && client.region !== filters.region) {
      return false
    }
    
    // Qidiruv (smart search)
    if (!filters.search) return true
    
    const searchLower = filters.search.toLowerCase().trim()
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

  const columns = [
    { 
      header: t('clients.no'), 
      accessor: 'id',
      render: (value, row, index) => {
        const num = index + 1
        return isNaN(num) ? '-' : num
      }
    },
    { 
      header: t('clients.name'), 
      accessor: 'name',
      render: (value) => <span className="font-bold text-gray-900">{value}</span>
    },
    { 
      header: t('clients.inn'), 
      accessor: 'inn',
      render: (value) => <span className="text-gray-600">{value || '-'}</span>
    },
    { 
      header: t('clients.contract_number'), 
      accessor: 'contract_number',
      render: (value) => <span className="text-gray-600">{value || '-'}</span>
    },
    { 
      header: t('clients.region'), 
      accessor: 'region',
      render: (value) => value ? <Badge text={value} color="bg-blue-100 text-blue-800" size="xs" /> : <span className="text-gray-500">-</span>
    },
    { 
      header: t('clients.phone'), 
      accessor: 'phone',
      render: (value) => <span className="text-gray-600">{value || '-'}</span>
    },
    
    // "Amallar" ustuni faqat readOnly=false bo'lganda qo'shiladi
    ...(readOnly ? [] : [{
      header: t('clients.actions'),
      accessor: 'id',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('edit-client', row.id) }}
            className="text-blue-600 hover:text-blue-800 font-bold text-sm"
            title={t('buttons.edit')}
          >
            ️
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
    return <Loading fullScreen text={t('clients.loading')} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('clients.title')}</h1>
          <p className="text-gray-500 mt-1">
            {userRegion ? `${t('clients.subtitle')} - ${t(`regions.${userRegion}`)}` : t('clients.subtitle', { count: filteredClients.length })}
          </p>
        </div>
        
        {!readOnly && (
          <Button onClick={() => onNavigate('new-client')} variant="primary">
            {t('buttons.new_client')}
          </Button>
        )}
      </div>

      {/* Filtrlar */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('clients.filter_region')}</label>
            <select
              value={filters.region}
              onChange={(e) => setFilters({...filters, region: e.target.value})}
              // ✅ Sales uchun select qulflanadi
              disabled={!!userRegion}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                userRegion ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
              }`}
            >
              {userRegion ? (
                // Sales uchun faqat o'z hududi
                <option value={userRegion}>{t(`regions.${userRegion}`)}</option>
              ) : (
                // Admin uchun barcha hududlar
                <>
                  <option value="">{t('clients.all_regions')}</option>
                  {REGIONS.map(regionKey => (
                    <option key={regionKey} value={regionKey}>{t(`regions.${regionKey}`)}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('clients.filter_search')}</label>
            <input
              type="text"
              placeholder={t('clients.search_placeholder')}
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
          data={filteredClients}
          onRowClick={(row) => onNavigate('client-detail', row.id)}
          emptyMessage={t('clients.no_clients')}
        />
      </Card>
    </div>
  )
}

export default ClientList