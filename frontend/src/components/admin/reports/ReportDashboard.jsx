// frontend/src/components/admin/reports/ReportDashboard.jsx
import { useState, useEffect } from 'react'
import { orderService } from '../../../services/orderService'
import { employeeService } from '../../../services/employeeService'
import { clientService } from '../../../services/clientService'
import { formatMoney } from '../../../utils/format'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next' // ✅ Import qo'shildi

// Chart.js komponentlari
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

// Chart.js ni ro'yxatdan o'tkazish
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

function ReportDashboard() {
  const { t } = useTranslation() // ✅ Hook chaqirildi

  // ✅ YANGI: Filtrlar uchun holat
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    employee_id: '',
    region: ''
  })

  // ✅ YANGI: Filtr variantlari uchun holat
  const [employees, setEmployees] = useState([])
  const [regions, setRegions] = useState([])

  const [report, setReport] = useState(null)
  const [kpiData, setKpiData] = useState([])
  const [productsData, setProductsData] = useState([])
  const [regionsData, setRegionsData] = useState([])
  const [paymentTypesData, setPaymentTypesData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFilterOptions()
    fetchAllReports()
  }, [])

  // ✅ YANGI: Filtrlar uchun ma'lumotlarni yuklash
  const fetchFilterOptions = async () => {
    try {
      const [employeesData, clientsData] = await Promise.all([
        employeeService.getAll(),
        clientService.getAll()
      ])
      setEmployees(employeesData)
      // Takrorlanmas hududlarni olish
      const uniqueRegions = [...new Set(clientsData.map(c => c.region).filter(Boolean))]
      setRegions(uniqueRegions)
    } catch (error) {
      console.error(t('reports.fetch_filters_error'), error)
    }
  }

    // ✅ YANGILANDI: Filtrlarni qabul qiladigan funksiya (422 xatoligi tuzatildi)
  const fetchAllReports = async (customFilters = null) => {
    setLoading(true)
    try {
      const activeFilters = customFilters || filters
      
      // Query parametrlarini shakllantirish
      const queryParams = new URLSearchParams({
        year: activeFilters.year,
        month: activeFilters.month
      })
      if (activeFilters.employee_id) queryParams.append('employee_id', activeFilters.employee_id)
      if (activeFilters.region) queryParams.append('region', activeFilters.region)
      
      const queryString = queryParams.toString()

      // Barcha hisobotlarni parallel yuklash
      const [
        mainReport,
        kpi,
        products,
        regions,
        paymentTypes
      ] = await Promise.all([
        orderService.getAdminReport(queryString),
        orderService.getEmployeesKPI(queryString),
        // ✅ TUZATILDI: Bu yerga queryString emas, faqat employee_id (yoki null) yuboriladi
        orderService.getProductsAnalysis(activeFilters.employee_id ? parseInt(activeFilters.employee_id) : null),
        orderService.getRegionsSales(queryString),
        orderService.getPaymentTypesDistribution(queryString)
      ])
      
      setReport(mainReport)
      setKpiData(kpi)
      setProductsData(products)
      setRegionsData(regions)
      setPaymentTypesData(paymentTypes)
    } catch (error) {
      console.error(t('reports.fetch_error'), error)
      alert(t('reports.fetch_alert_error'))
    } finally {
      setLoading(false)
    }
  }

  // ✅ YANGI: Filtr o'zgarganda
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  // ✅ YANGI: Qidirish tugmasi bosilganda
  const applyFilters = (e) => {
    e.preventDefault()
    fetchAllReports(filters)
  }

  // ✅ YANGI: Filtrlarni tozalash
  const resetFilters = () => {
    const defaultFilters = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      employee_id: '',
      region: ''
    }
    setFilters(defaultFilters)
    fetchAllReports(defaultFilters)
  }

  if (loading) {
    return <Loading fullScreen text={t('reports.loading')} />
  }

  // Diagramma ma'lumotlari
  const productsChartData = {
    labels: productsData.map(p => p.product_name),
    datasets: [{
      label: t('charts.sold_amount'),
      data: productsData.map(p => p.total_revenue),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  }

  const regionsChartData = {
    labels: regionsData.map(r => r.region),
    datasets: [{
      label: t('charts.sales_amount'),
      data: regionsData.map(r => r.total_sales),
      backgroundColor: [
        'rgba(59, 130, 246, 0.5)',
        'rgba(16, 185, 129, 0.5)',
        'rgba(245, 158, 11, 0.5)',
        'rgba(239, 68, 68, 0.5)',
        'rgba(139, 92, 246, 0.5)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)'
      ],
      borderWidth: 1
    }]
  }

  const paymentTypesChartData = {
    labels: paymentTypesData.map(p => t(`paymentTypes.${p.type}`)), // ✅ t() funksiyasi qo'shildi
    datasets: [{
      data: paymentTypesData.map(p => p.total),
      backgroundColor: [
        'rgba(59, 130, 246, 0.5)',
        'rgba(16, 185, 129, 0.5)',
        'rgba(245, 158, 11, 0.5)',
        'rgba(239, 68, 68, 0.5)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 1
    }]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: { size: 12 }
        }
      },
      title: { 
        display: false  // ❌ "Статистика" ni o'chirish
      }
    }
  }

  const months = [
    { value: 1, label: 'months.jan' }, { value: 2, label: 'months.feb' }, { value: 3, label: 'months.mar' },
    { value: 4, label: 'months.apr' }, { value: 5, label: 'months.may' }, { value: 6, label: 'months.jun' },
    { value: 7, label: 'months.jul' }, { value: 8, label: 'months.aug' }, { value: 9, label: 'months.sep' },
    { value: 10, label: 'months.oct' }, { value: 11, label: 'months.nov' }, { value: 12, label: 'months.dec' }
  ]
  const currentYear = new Date().getFullYear()
  const years = [
    { value: currentYear, label: currentYear },
    { value: currentYear - 1, label: currentYear - 1 },
    { value: currentYear - 2, label: currentYear - 2 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('reports.title')}</h1>
          <p className="text-gray-500 mt-1">
            {t('reports.subtitle', { month: filters.month, year: filters.year })}
          </p>
        </div>
        <button 
          onClick={() => fetchAllReports()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
        >
          {t('buttons.refresh')}
        </button>
      </div>

      {/* ✅ YANGI: FILTRLAR PANELI */}
      <Card padding="md">
        <form onSubmit={applyFilters}>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('reports.filters_title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Yil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.filter_year')}</label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>

            {/* Oy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.filter_month')}</label>
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map(m => <option key={m.value} value={m.value}>{t(m.label)}</option>)}
              </select>
            </div>

            {/* Xodim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.filter_employee')}</label>
              <select
                name="employee_id"
                value={filters.employee_id}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('reports.all_employees')}</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                ))}
              </select>
            </div>

            {/* Hudud */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.filter_region')}</label>
              <select
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('reports.all_regions')}</option>
                {regions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="submit" variant="primary">{t('buttons.search')}</Button>
            <Button type="button" onClick={resetFilters} variant="secondary">{t('buttons.reset')}</Button>
          </div>
        </form>
      </Card>

      {/* Asosiy Ko'rsatkichlar (KPI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="md" className="border-l-4 border-green-500 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">{t('reports.kpi_total_sales')}</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">{formatMoney(report?.total_sales || 0)}</h3>
        </Card>
        <Card padding="md" className="border-l-4 border-red-500 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">{t('reports.kpi_total_debt')}</p>
          <h3 className="text-2xl font-bold text-red-600 mt-2">{formatMoney(report?.total_debt || 0)}</h3>
        </Card>
        <Card padding="md" className="border-l-4 border-blue-500 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">{t('reports.kpi_approved_orders')}</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">{report?.approved_orders || 0} {t('common.units')}</h3>
        </Card>
        <Card padding="md" className="border-l-4 border-purple-500 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">{t('reports.kpi_total_orders')}</p>
          <h3 className="text-2xl font-bold text-purple-600 mt-2">{report?.total_orders || 0} {t('common.units')}</h3>
        </Card>
      </div>

      {/* XODIMLAR KPI */}
      {kpiData.length > 0 && (
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('reports.kpi_employees_title')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('reports.table_no')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('reports.table_name')}</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">{t('reports.table_region')}</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 uppercase">{t('reports.table_sales')}</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 uppercase">{t('reports.table_orders')}</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 uppercase">{t('reports.table_clients')}</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 uppercase">{t('reports.table_avg_order')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {kpiData.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{emp.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.region || '-'}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">{formatMoney(emp.total_sales)}</td>
                    <td className="px-4 py-3 text-sm text-right">{emp.total_orders}</td>
                    <td className="px-4 py-3 text-sm text-right">{emp.total_clients}</td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600">{formatMoney(emp.avg_order_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* GRAFIKLAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {productsData.length > 0 && (
          <Card padding="md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('charts.top_products')}</h3>
            <Bar data={productsChartData} options={chartOptions} />
          </Card>
        )}
        {regionsData.length > 0 && (
          <Card padding="md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('charts.sales_by_region')}</h3>
            <Bar data={regionsChartData} options={chartOptions} />
          </Card>
        )}
      </div>

      {paymentTypesData.length > 0 && (
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📁 {t('charts.payment_distribution')}
          </h3>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Pie data={paymentTypesChartData} options={chartOptions} />
            </div>
          </div>
        </Card>
      )}

      {/* Qo'shimcha Ma'lumot */}
      <Card padding="md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('reports.system_status_title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 font-medium">{t('reports.status_pending')}</p>
            <p className="text-xl font-bold text-yellow-700 mt-1">{report?.pending_orders || 0} {t('common.units')}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-800 font-medium">{t('reports.status_rejected')}</p>
            <p className="text-xl font-bold text-gray-700 mt-1">{report?.rejected_orders || 0} {t('common.units')}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4" dangerouslySetInnerHTML={{ __html: t('reports.footer_note') }} />
      </Card>
    </div>
  )
}

export default ReportDashboard