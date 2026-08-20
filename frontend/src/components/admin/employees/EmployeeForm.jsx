// frontend/src/components/admin/employees/EmployeeForm.jsx
import { useState, useEffect } from 'react'
import { employeeService } from '../../../services/employeeService'
import { ROLES, REGIONS } from '../../../utils/constants'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Input from '../../common/Input'
import Select from '../../common/Select'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next' // ✅ Import qo'shildi

function EmployeeForm({ onBack, editingEmployeeId }) {
  const { t } = useTranslation() // ✅ Hook chaqirildi
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'sales',
    region: ''
  })

  useEffect(() => {
    if (editingEmployeeId) {
      loadEmployeeData()
    }
  }, [editingEmployeeId])

  const loadEmployeeData = async () => {
    setLoading(true)
    try {
      const employee = await employeeService.getById(editingEmployeeId)
      setFormData({
        full_name: employee.full_name || '',
        email: employee.email || '',
        password: '',
        role: employee.role || 'sales',
        region: employee.region || ''
      })
    } catch (error) {
      console.error(t('employeeForm.fetch_error'), error)
      alert(t('employeeForm.load_error'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.full_name || !formData.email) {
      alert(t('employeeForm.error_name_email'))
      return
    }

    if (!editingEmployeeId && !formData.password) {
      alert(t('employeeForm.error_password'))
      return
    }

    setLoading(true)
    try {
      const payload = { ...formData }
      
      // Tahrirlashda parol bo'sh bo'lsa, o'chiramiz
      if (editingEmployeeId && !formData.password) {
        delete payload.password
      }

      if (editingEmployeeId) {
        await employeeService.update(editingEmployeeId, payload)
        alert(t('employeeForm.updated_success'))
      } else {
        await employeeService.create(payload)
        alert(t('employeeForm.created_success'))
      }
      
      onBack()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && editingEmployeeId) {
    return <Loading fullScreen text={t('employeeForm.loading_data')} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {editingEmployeeId ? t('employeeForm.edit_title') : t('employeeForm.create_title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {editingEmployeeId ? t('employeeForm.edit_subtitle') : t('employeeForm.create_subtitle')}
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
              label={t('employeeForm.full_name')}
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              placeholder={t('employeeForm.name_placeholder')}
              required
            />

            <Input
              label={t('employeeForm.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="example@mail.com"
              required
            />

            <Input
              label={t('employeeForm.password') + (editingEmployeeId ? ` (${t('employeeForm.password_edit_hint')})` : ' *')}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              required={!editingEmployeeId}
            />

            <Select
              label={t('employeeForm.role')}
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              options={ROLES.map(r => ({ 
                value: r.value, 
                label: t(`roles.${r.value}`) // ✅ Lavozim nomini tarjima qilish
              }))}
              required
            />

            <div className="md:col-span-2">
              {/* ✅ MUHIM O'ZGARISH SHU YERDA: label: t(`regions.${r}`) */}
              <Select
                label={t('employeeForm.region')}
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
                options={REGIONS.map(r => ({ value: r, label: t(`regions.${r}`) }))}
                placeholder={t('employeeForm.select_region')}
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-4 mt-6">
          <Button type="submit" variant="primary" disabled={loading} className="flex-1">
            {loading ? t('common.saving') : (editingEmployeeId ? t('buttons.update') : t('buttons.create'))}
          </Button>
          <Button type="button" onClick={onBack} variant="secondary">
            {t('buttons.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EmployeeForm