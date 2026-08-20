// frontend/src/components/admin/reports/SalesPerformanceReport.jsx
import { useState, useEffect } from 'react'
import { orderService } from '../../../services/orderService' // ✅ 3 ta ../ (admin/reports dan src gacha)
import { formatMoney } from '../../../utils/format'           // ✅ 3 ta ../
import Card from '../../common/Card'                          // ✅ 2 ta ../ (admin dan components gacha)
import Button from '../../common/Button'                      // ✅ 2 ta ../
import Loading from '../../common/Loading'                    // ✅ 2 ta ../
import { useTranslation } from 'react-i18next'

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
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)
// ✅ Prop: employeeId (kimning hisoboti), onBack (orqaga qaytish), isOwnReport (o'zini ko'ryaptimi)
function SalesPerformanceReport({ employeeId, onBack, isOwnReport = false }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState(null)
  
  // Diagrammalar uchun ma'lumotlar
  const [productsChartData, setProductsChartData] = useState(null)
  const [statusChartData, setStatusChartData] = useState(null)

  useEffect(() => {
    fetchReportData()
  }, [employeeId])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // 1. Asosiy KPI ma'lumotlari
      const kpiData = await orderService.getEmployeeReport(employeeId)
      setReportData(kpiData)

      // 2. Mahsulotlar tahlili (Backend'da employee_id filtri qo'shilgan deb hisoblaymiz, 
      // agar yo'q bo'lsa, umumiy ma'lumotni ko'rsatadi)
      const productsData = await orderService.getProductsAnalysis(employeeId)
      
      if (productsData && productsData.length > 0) {
        setProductsChartData({
          labels: productsData.slice(0, 5).map(p => p.product_name), // Top 5
          datasets: [{
            label: t('reports.sold_amount'),
            data: productsData.slice(0, 5).map(p => p.total_revenue),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        })
      }

      // 3. Buyurtma holatlari bo'yicha diagramma
      if (kpiData) {
        setStatusChartData({
          labels: [t('sales.approved'), t('sales.pending'), t('sales.rejected'), t('sales.cancelled')],
          datasets: [{
            data: [
              kpiData.approved_orders || 0,
              kpiData.pending_orders || 0,
              kpiData.rejected_orders || 0,
              kpiData.cancelled_orders || 0
            ],
            backgroundColor: [
              'rgba(16, 185, 129, 0.6)', // Yashil (Approved)
              'rgba(245, 158, 11, 0.6)', // Sariq (Pending)
              'rgba(239, 68, 68, 0.6)',  // Qizil (Rejected)
              'rgba(107, 114, 128, 0.6)' // Kulrang (Cancelled)
            ],
            borderColor: [
              'rgba(16, 185, 129, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(239, 68, 68, 1)',
              'rgba(107, 114, 128, 1)'
            ],
            borderWidth: 1
          }]
        })
      }

    } catch (error) {
      console.error(t('reports.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    }
  }

  if (loading) {
    return <Loading fullScreen text={t('reports.loading')} />
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t('common.no_data')}</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">{t('buttons.back')}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isOwnReport ? t('sales.my_performance_report') : `${reportData.employee_name} - ${t('reports.performance_title')}`}
          </h1>
          <p className="text-gray-500 mt-1">
            {reportData.employee_region} | {reportData.month}
          </p>
        </div>
        <Button onClick={onBack} variant="secondary">
          {t('buttons.back')}
        </Button>
      </div>

      {/* 1. KPI Kartochkalari */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="md" className="border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">{t('reports.kpi_total_sales')}</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">{formatMoney(reportData.total_sales || 0)}</h3>
        </Card>
        <Card padding="md" className="border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">{t('reports.kpi_total_orders')}</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">{reportData.total_orders || 0}</h3>
        </Card>
        <Card padding="md" className="border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 font-medium">{t('sales.total_clients')}</p>
          <h3 className="text-2xl font-bold text-purple-600 mt-2">{reportData.total_clients || 0}</h3>
        </Card>
        <Card padding="md" className="border-l-4 border-red-500">
          <p className="text-sm text-gray-500 font-medium">{t('reports.kpi_total_debt')}</p>
          <h3 className="text-2xl font-bold text-red-600 mt-2">{formatMoney(reportData.total_debt || 0)}</h3>
        </Card>
      </div>

      {/* 2. Diagrammalar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mahsulotlar diagrammasi */}
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 {t('charts.top_products')}</h3>
          <div className="h-64">
            {productsChartData ? (
              <Bar data={productsChartData} options={chartOptions} />
            ) : (
              <p className="text-center text-gray-500 mt-20">{t('common.no_data')}</p>
            )}
          </div>
        </Card>

        {/* Buyurtma holatlari diagrammasi */}
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📈 {t('charts.order_status_distribution')}</h3>
          <div className="h-64 flex justify-center">
            {statusChartData ? (
              <Pie data={statusChartData} options={chartOptions} />
            ) : (
              <p className="text-center text-gray-500 mt-20">{t('common.no_data')}</p>
            )}
          </div>
        </Card>
      </div>

      {/* 3. Batafsil statistika jadvali */}
      <Card padding="md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📋 {t('reports.detailed_kpi_table')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-700">{t('reports.table_metric')}</th>
                <th className="px-4 py-3 text-right font-bold text-gray-700">{t('reports.table_value')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-gray-600">{t('sales.approved')}</td>
                <td className="px-4 py-3 text-right font-bold text-green-600">{reportData.approved_orders || 0}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-600">{t('sales.pending')}</td>
                <td className="px-4 py-3 text-right font-bold text-yellow-600">{reportData.pending_orders || 0}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-600">{t('sales.rejected')}</td>
                <td className="px-4 py-3 text-right font-bold text-red-600">{reportData.rejected_orders || 0}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-600">{t('sales.cancelled')}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-600">{reportData.cancelled_orders || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default SalesPerformanceReport