// frontend/src/components/admin/clients/ClientForm.jsx
import { useState, useEffect } from 'react'
import { clientService } from '../../../services/clientService'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Input from '../../common/Input'
import Select from '../../common/Select'
import Loading from '../../common/Loading'
import { REGIONS } from '../../../utils/constants'
import { useTranslation } from 'react-i18next'

function ClientForm({ onBack, editingClientId }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    inn: '',
    contract_number: '',
    region: '',
    address: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    if (editingClientId) {
      loadClientData()
    }
  }, [editingClientId])

  const loadClientData = async () => {
    setLoading(true)
    try {
      const client = await clientService.getById(editingClientId)
      setFormData({
        name: client.name || '',
        inn: client.inn || '',
        contract_number: client.contract_number || '',
        region: client.region || '',
        address: client.address || '',
        phone: client.phone || '',
        email: client.email || ''
      })
    } catch (error) {
      console.error(t('clientForm.load_error_log'), error)
      alert(t('clientForm.load_error'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name) {
      alert(t('clientForm.enter_name'))
      return
    }

    setLoading(true)
    try {
      if (editingClientId) {
        await clientService.update(editingClientId, formData)
        alert(t('clientForm.updated_success'))
      } else {
        await clientService.create(formData)
        alert(t('clientForm.created_success'))
      }
      
      onBack()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && editingClientId) {
    return <Loading fullScreen text={t('clientForm.loading_data')} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {editingClientId ? t('clientForm.edit_title') : t('clientForm.create_title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {editingClientId ? t('clientForm.edit_subtitle') : t('clientForm.create_subtitle')}
          </p>
        </div>
        <Button onClick={onBack} variant="secondary">
          {t('buttons.back')}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card padding="md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t('clientForm.client_name')}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={t('clientForm.name_placeholder')}
              required
            />

            <Input
              label={t('clientForm.inn')}
              value={formData.inn}
              onChange={(e) => setFormData({...formData, inn: e.target.value})}
              placeholder="123456789"
            />

            <Input
              label={t('clientForm.contract_number')}
              value={formData.contract_number}
              onChange={(e) => setFormData({...formData, contract_number: e.target.value})}
              placeholder="SH-2024-001"
            />

            {/* ✅ MUHIM O'ZGARISH SHU YERDA: label: t(`regions.${r}`) */}
            <Select
              label={t('clientForm.region')}
              value={formData.region}
              onChange={(e) => setFormData({...formData, region: e.target.value})}
              options={REGIONS.map(r => ({ value: r, label: t(`regions.${r}`) }))}
              placeholder={t('clientForm.select_region')}
            />

            <Input
              label={t('clientForm.phone')}
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+998 90 123 45 67"
            />

            <Input
              label={t('clientForm.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="example@mail.com"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('clientForm.address')}</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder={t('clientForm.address_placeholder')}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Tugmalar */}
        <div className="flex gap-4 mt-6">
          <Button type="submit" variant="primary" disabled={loading} className="flex-1">
            {loading ? t('common.saving') : (editingClientId ? t('buttons.update') : t('buttons.create'))}
          </Button>
          <Button type="button" onClick={onBack} variant="secondary">
            {t('buttons.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ClientForm