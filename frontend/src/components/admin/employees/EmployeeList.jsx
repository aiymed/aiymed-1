// frontend/src/components/admin/employees/EmployeeList.jsx
import { useState, useEffect } from 'react'
import { employeeService } from '../../../services/employeeService'
import { ROLES, REGIONS } from '../../../utils/constants'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Badge from '../../common/Badge'
import Table from '../../common/Table'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next'

// ✅ 1-O'ZGARISH: readOnly prop qo'shildi (default qiymati false)
function EmployeeList({ onNavigate, readOnly = false }) {
  const { t } = useTranslation()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const data = await employeeService.getAll()
      setEmployees(data)
    } catch (error) {
      console.error(t('employeeList.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (employeeId, employeeName) => {
    if (!window.confirm(t('employeeList.confirm_delete', { name: employeeName }))) {
      return
    }

    try {
      await employeeService.delete(employeeId)
      alert(t('employeeList.delete_success'))
      fetchEmployees()
    } catch (error) {
      alert(t('common.error') + ': ' + error.message)
    }
  }

  const getRoleBadge = (role) => {
    const r = ROLES.find(r => r.value === role)
    if (!r) return <Badge text={t('employeeList.unknown_role')} color="bg-gray-100 text-gray-800" size="xs" />
    return <Badge text={t(`roles.${role}`)} color={r.color} size="xs" />
  }

  const columns = [
    { 
      header: t('employeeList.no'), 
      accessor: 'id',
      render: (_, row, index) => index + 1
    },
    { 
      header: t('employeeList.name'), 
      accessor: 'full_name',
      render: (value) => <span className="font-bold text-gray-900">{value}</span>
    },
    { 
      header: t('employeeList.email'), 
      accessor: 'email',
      render: (value) => <span className="text-gray-600">{value}</span>
    },
    { 
      header: t('employeeList.role'), 
      accessor: 'role',
      render: (value) => getRoleBadge(value)
    },
    { 
      header: t('employeeList.region'), 
      accessor: 'region',
      render: (value) => value ? <Badge text={value} color="bg-blue-100 text-blue-800" size="xs" /> : <span className="text-gray-500">-</span>
    },
    
    // ✅ 2-O'ZGARISH: "Amallar" ustuni faqat readOnly=false bo'lganda qo'shiladi
    ...(readOnly ? [] : [{
      header: t('employeeList.actions'),
      accessor: 'id',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('edit-employee', row.id) }}
            className="text-blue-600 hover:text-blue-800 font-bold text-sm"
            title={t('buttons.edit')}
          >
            ✏️ {t('buttons.edit')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id, row.full_name) }}
            className="text-red-600 hover:text-red-800 font-bold text-sm"
            title={t('buttons.delete')}
          >
            🗑️ {t('buttons.delete')}
          </button>
        </div>
      )
    }])
  ]

  if (loading) {
    return <Loading fullScreen text={t('employeeList.loading')} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('employeeList.title')}</h1>
          <p className="text-gray-500 mt-1">{t('employeeList.subtitle', { count: employees.length })}</p>
        </div>
        
        {/* ✅ 3-O'ZGARISH: "Yangi xodim" tugmasi faqat readOnly=false bo'lganda ko'rsatiladi */}
        {!readOnly && (
          <Button onClick={() => onNavigate('new-employee')} variant="primary">
            {t('buttons.new_employee')}
          </Button>
        )}
      </div>

      <Card padding="none">
        <Table
          columns={columns}
          data={employees}
          onRowClick={(row) => onNavigate('employee-report', row.id)}
          emptyMessage={t('employeeList.no_employees')}
        />
      </Card>
    </div>
  )
}

export default EmployeeList