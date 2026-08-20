// frontend/src/components/admin/reports/ReportFilters.jsx
import { useState, useEffect } from 'react'
import { employeeService } from '../../../services/employeeService'
import { clientService } from '../../../services/clientService'
import Card from '../../common/Card'
import Button from '../../common/Button'
import { useTranslation } from 'react-i18next' // ✅ Import qo'shildi

function ReportFilters({ onApplyFilters }) {
  const { t } = useTranslation() // ✅ Hook chaqirildi
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1, // 1-12
    employee_id: '',
    region: ''
  })
  
  const [employees, setEmployees] = useState([])
  const [regions, setRegions] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [employeesData, clientsData] = await Promise.all([
        employeeService.getAll(),
        clientService.getAll()
      ])
      
      setEmployees(employeesData)
      
      // Unikal hududlarni olish
      const uniqueRegions = [...new Set(clientsData.map(c => c.region).filter(Boolean))]
      setRegions(uniqueRegions)
    } catch (error) {
      console.error(t('reportFilters.fetch_error'), error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onApplyFilters(filters)
  }

  const handleReset = () => {
    const defaultFilters = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      employee_id: '',
      region: ''
    }
    setFilters(defaultFilters)
    onApplyFilters(defaultFilters)
  }

  // Oylar ro'yxati (tarjima kalitlari bilan)
  const months = [
    { value: 1, label: 'months.jan' },
    { value: 2, label: 'months.feb' },
    { value: 3, label: 'months.mar' },
    { value: 4, label: 'months.apr' },
    { value: 5, label: 'months.may' },
    { value: 6, label: 'months.jun' },
    { value: 7, label: 'months.jul' },
    { value: 8, label: 'months.aug' },
    { value: 9, label: 'months.sep' },
    { value: 10, label: 'months.oct' },
    { value: 11, label: 'months.nov' },
    { value: 12, label: 'months.dec' }
  ]

  // Yillar ro'yxati (joriy yil va o'tgan 2 yil)
  const currentYear = new Date().getFullYear()
  const years = [
    { value: currentYear, label: currentYear },
    { value: currentYear - 1, label: currentYear - 1 },
    { value: currentYear - 2, label: currentYear - 2 }
  ]

  return (
    <Card padding="md">
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔎 {t('reportFilters.title')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Yil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportFilters.year')}</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map(year => (
                <option key={year.value} value={year.value}>{year.label}</option>
              ))}
            </select>
          </div>

          {/* Oy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportFilters.month')}</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{t(month.label)}</option>
              ))}
            </select>
          </div>

          {/* Xodim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportFilters.employee')}</label>
            <select
              value={filters.employee_id}
              onChange={(e) => setFilters({...filters, employee_id: e.target.value ? parseInt(e.target.value) : ''})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('reportFilters.all_employees')}</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>

          {/* Hudud */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportFilters.region')}</label>
            <select
              value={filters.region}
              onChange={(e) => setFilters({...filters, region: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('reportFilters.all_regions')}</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tugmalar */}
        <div className="flex gap-3 mt-6">
          <Button type="submit" variant="primary">
            {t('buttons.search')}
          </Button>
          <Button type="button" onClick={handleReset} variant="secondary">
            {t('buttons.reset')}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ReportFilters