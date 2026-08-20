// frontend/src/components/admin/employees/EmployeeReport.jsx
import { useState, useEffect } from 'react'
import { orderService } from '../../../services/orderService'
import { employeeService } from '../../../services/employeeService'
import { formatDate, formatMoney } from '../../../utils/format'
import { ORDER_STATUS_BADGES } from '../../../utils/constants'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Badge from '../../common/Badge'
import Loading from '../../common/Loading'
import { useTranslation } from 'react-i18next'

// ✅ 1. YANGI: Chart.js importlariga Pie va ArcElement qo'shildi
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // <-- Qo'shildi
} from 'chart.js'

// Chart.js ni ro'yxatdan o'tkazish
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

// ✅ 2-O'ZGARISH: readOnly prop qo'shildi
function EmployeeReport({ employeeId, onBack, readOnly = false }) {
  const { t } = useTranslation()
  
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // ✅ 2. YANGI: Diagrammalar uchun state'lar
  const [productsChartData, setProductsChartData] = useState(null)
  const [clientsSalesData, setClientsSalesData] = useState(null) 
  const [paymentTypesData, setPaymentTypesData] = useState(null) // ✅ YANGI QO'SHILDI

  useEffect(() => {
    fetchReport()
  }, [employeeId])

  // ✅ 3. YANGILANGAN: Diagramma ma'lumotlarini ham yuklaydigan funksiya
  const fetchReport = async () => {
    setLoading(true)
    try {
      // 1. Asosiy KPI ma'lumotlari
      const kpiData = await orderService.getEmployeeReport(employeeId)
      setReport(kpiData)

      // 2. Mahsulotlar tahlili (faqat shu xodim uchun)
      try {
        const productsData = await orderService.getProductsAnalysis(employeeId)
        if (productsData && productsData.length > 0) {
          setProductsChartData({
            labels: productsData.slice(0, 5).map(p => p.product_name),
            datasets: [{
              label: 'Sotuv summasi',
              data: productsData.slice(0, 5).map(p => p.total_revenue),
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1
            }]
          })
        }
      } catch (err) {
        console.error('Mahsulotlar ma\'lumotini olishda xatolik:', err)
      }

      // 3. ✅ YANGI: Mijozlar bo'yicha savdo statistikasi (faqat shu xodimning hududidagi)
      try {
        const clientsData = await orderService.getClientsDebt(kpiData.employee_region)
        
        // Eng ko'p savdo qilgan top 5 mijozni saralash (total_sales bo'yicha)
        const topClients = [...clientsData]
          .sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0))
          .slice(0, 5)
        
        if (topClients.length > 0) {
          setClientsSalesData({
            labels: topClients.map(c => c.client_name),
            datasets: [{
              label: 'Savdo hajmi',
              data: topClients.map(c => c.total_sales || 0),
              backgroundColor: 'rgba(16, 185, 129, 0.6)', // Yashil rang (savdo/sotuv)
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 1
            }]
          })
        }
      } catch (err) {
        console.error('Mijozlar savdo ma\'lumotini olishda xatolik:', err)
      }

     // ✅ 4. YANGI: To'lov turlari bo'yicha taqsimot (Xodimning hududi bo'yicha, Retail YO'Q)
    try {
      if (kpiData.employee_region) {
        const paymentTypes = await orderService.getPaymentTypesDistributionByRegion(kpiData.employee_region)
        if (paymentTypes && paymentTypes.length > 0) {
          const colorMap = {
            'wholesale_30': { bg: 'rgba(59, 130, 246, 0.6)', border: 'rgba(59, 130, 246, 1)' },
            'wholesale_50': { bg: 'rgba(139, 92, 246, 0.6)', border: 'rgba(139, 92, 246, 1)' },
            'wholesale_100': { bg: 'rgba(16, 185, 129, 0.6)', border: 'rgba(16, 185, 129, 1)' }
          }
          
          setPaymentTypesData({
            // ✅ MUHIM: Backend'dan kelgan label o'rniga p.type dan foydalanib t() chaqiramiz
            labels: paymentTypes.map(p => t(`paymentTypes.${p.type}`)),
            datasets: [{
              data: paymentTypes.map(p => p.total),
              backgroundColor: paymentTypes.map(p => colorMap[p.type]?.bg || 'rgba(100, 100, 100, 0.6)'),
              borderColor: paymentTypes.map(p => colorMap[p.type]?.border || 'rgba(100, 100, 100, 1)'),
              borderWidth: 1
            }]
          })
        }
      }
    } catch (err) {
      console.error('To\'lov turlari ma\'lumotini olishda xatolik:', err)
    }

    } catch (error) {
      console.error(t('employeeReport.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading fullScreen text={t('employeeReport.loading')} />
  }

  if (!report) {
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
          <h1 className="text-2xl font-bold text-gray-800">{t('employeeReport.title', { name: report.employee_name })}</h1>
          <p className="text-gray-500 mt-1">
            {report.employee_role} | {report.employee_region || t('employeeReport.no_region')} | {report.month}
          </p>
        </div>
        <Button onClick={onBack} variant="secondary">
          {t('buttons.back')}
        </Button>
      </div>

      {/* Asosiy ko'rsatkichlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="md" className="border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">{t('employeeReport.total_sales')}</p>
          <h3 className="text-2xl font-bold text-purple-600 mt-2">{formatMoney(report.total_sales || 0)}</h3>
        </Card>

        <Card padding="md" className="border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">{t('employeeReport.total_debt')}</p>
          <h3 className="text-2xl font-bold text-yellow-600 mt-2">{formatMoney(report.total_debt || 0)}</h3>
        </Card>

        <Card padding="md" className="border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">{t('employeeReport.total_orders_label')}</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">{t('employeeReport.total_orders', { count: report.total_orders || 0 })}</h3>
        </Card>
      </div>

      {/* Batafsil statistika */}
      <Card padding="md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employeeReport.detailed_stats')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">{t('employeeReport.approved')}</p>
            <p className="text-xl font-bold text-green-600">{report.approved_orders || 0}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">{t('employeeReport.pending')}</p>
            <p className="text-xl font-bold text-yellow-600">{report.pending_orders || 0}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">{t('employeeReport.rejected')}</p>
            <p className="text-xl font-bold text-red-600">{report.rejected_orders || 0}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{t('employeeReport.total_clients')}</p>
            <p className="text-xl font-bold text-gray-600">{report.total_clients || 0}</p>
          </div>
        </div>
      </Card>

      {/* ✅ 4. YANGILANGAN: DIAGRAMMALAR BO'LIMI (Ikkala tomonda ustunli diagramma) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Mahsulotlar (Tik ustunli) */}
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📊 {t('charts.top_products')}
          </h3>
          <div className="h-64">
            {productsChartData ? (
              <Bar 
                data={productsChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: 'bottom',
                      labels: {
                        color: '#475569',
                        font: { size: 13, weight: '600' }
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        color: 'rgba(0, 0, 0, 0.04)',
                        drawBorder: false
                      },
                      ticks: {
                        color: '#334155',
                        font: { size: 12, weight: '500' }
                      }
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                      },
                      ticks: {
                        color: '#475569',
                        font: { size: 11 },
                        callback: function(value) {
                          return value.toLocaleString();
                        }
                      }
                    }
                  }
                }} 
              />
            ) : (
              <p className="text-center text-gray-500 mt-24">{t('common.no_data')}</p>
            )}
          </div>
        </Card>

        {/* ✅ YANGI: Mijozlar bo'yicha savdo statistikasi (Gorizontal ustunli) */}
        <Card padding="md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📈 {t('charts.clients_sales_stats')}
          </h3>
          <div className="h-64">
            {clientsSalesData ? (
              <Bar 
                data={clientsSalesData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: { 
                    legend: { display: false },
                    title: {
                      display: true,
                      text: t('charts.sales_volume'),
                      color: '#475569',
                      font: { size: 13, weight: '600' }
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.04)',
                        drawBorder: false
                      },
                      ticks: {
                        color: '#334155',
                        font: { size: 11, weight: '500' },
                        callback: function(value) {
                          return value.toLocaleString() + " " + t('common.currency');
                        }
                      }
                    },
                    y: {
                      grid: {
                        color: 'rgba(0, 0, 0, 0.03)',
                        drawBorder: false
                      },
                      ticks: {
                        color: '#1e293b',
                        font: { size: 12, weight: '600' }
                      }
                    }
                  }
                }} 
              />
            ) : (
              <p className="text-center text-gray-500 mt-24">{t('common.no_data')}</p>
            )}
          </div>
        </Card>
      </div>

      {/* ✅ 5. YANGI: To'lov turlari bo'yicha taqsimot (Doira diagramma - Retail YO'Q) */}
      <Card padding="md">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
          💳 {t('charts.payment_distribution')} ({report.employee_region || t('employeeReport.no_region')})
        </h3>
        <div className="h-64 flex justify-center">
          {paymentTypesData ? (
            <Pie 
              data={paymentTypesData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    position: 'bottom',
                    labels: {
                      color: '#475569',
                      font: { size: 12, weight: '500' }
                    }
                  }
                }
              }} 
            />
          ) : (
            <p className="text-center text-gray-500 mt-24">{t('common.no_data')}</p>
          )}
        </div>
      </Card>

    </div>
  )
}

export default EmployeeReport