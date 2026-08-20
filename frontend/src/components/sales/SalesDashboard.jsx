// frontend/src/components/sales/SalesDashboard.jsx
import { useState, useEffect } from 'react'
import { orderService } from '../../services/orderService'
import { formatMoney } from '../../utils/format'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'
import Loading from '../common/Loading'

// Admin komponentlarini import qilamiz
import OrderList from '../admin/orders/OrderList'
import OrderDetail from '../admin/orders/OrderDetail'
import OrderForm from '../admin/orders/OrderForm'
import ClientList from '../admin/clients/ClientList'
import ClientDetail from '../admin/clients/ClientDetail'
import PaymentList from '../admin/payments/PaymentList'
import PaymentDetail from '../admin/payments/PaymentDetail'
import ProductList from '../admin/products/ProductList'
import ProductDetail from '../admin/products/ProductDetail'
import EmployeeReport from '../admin/employees/EmployeeReport'

import { useTranslation } from 'react-i18next'

// ✅ 1. O'ZGARISH: Pie va ArcElement qo'shildi
import { Bar, Pie } from 'react-chartjs-2'
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

// Chart.js ni ro'yxatdan o'tkazish
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

function SalesDashboard({ user, onLogout }) {
  const { i18n, t } = useTranslation()
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [currentView, setCurrentView] = useState('home')
  const [selectedId, setSelectedId] = useState(null)

  // ✅ Diagrammalar uchun state'lar
  const [productsChartData, setProductsChartData] = useState(null)
  const [clientsSalesData, setClientsSalesData] = useState(null)
  const [paymentTypesData, setPaymentTypesData] = useState(null) // ✅ YANGI: To'lov turlari uchun

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
    setShowLangDropdown(false)
  }

  const languages = [
    { code: 'uz', flag: '🇺🇿', name: "O'zbek tili" },
    { code: 'ru', flag: '🇷🇺', name: "Русский" },
    { code: 'en', flag: '🇬🇧', name: "English" },
    { code: 'hi', flag: '🇮🇳', name: "हिन्दी" }
  ]

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0]

  useEffect(() => {
    fetchSalesReport()
  }, [])

  // ✅ YANGILANGAN: Diagramma ma'lumotlarini ham yuklaydigan funksiya
  const fetchSalesReport = async () => {
    setLoading(true)
    try {
      // 1. Asosiy KPI ma'lumotlari
      const kpiData = await orderService.getEmployeeReport(user.id)
      setReport(kpiData)

      // 2. Mahsulotlar tahlili
      try {
        const productsData = await orderService.getProductsAnalysis(user.id)
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

      // 3. Mijozlar bo'yicha savdo statistikasi
      try {
        const clientsData = await orderService.getClientsDebt(user.region)
        const topClients = [...clientsData]
          .sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0))
          .slice(0, 5)
        
        if (topClients.length > 0) {
          setClientsSalesData({
            labels: topClients.map(c => c.client_name),
            datasets: [{
              label: 'Savdo hajmi',
              data: topClients.map(c => c.total_sales || 0),
              backgroundColor: 'rgba(16, 185, 129, 0.6)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 1
            }]
          })
        }
      } catch (err) {
        console.error('Mijozlar savdo ma\'lumotini olishda xatolik:', err)
      }

      // ✅ 4. To'lov turlari bo'yicha taqsimot (Sales uchun - retail YO'Q)
      try {
        const paymentTypes = await orderService.getPaymentTypesDistributionByRegion(user.region)
        if (paymentTypes && paymentTypes.length > 0) {
          // ✅ Ranglar faqat 3 ta ulgurji tur uchun (retail yo'q)
          const colorMap = {
            'wholesale_30': { bg: 'rgba(59, 130, 246, 0.6)', border: 'rgba(59, 130, 246, 1)' },
            'wholesale_50': { bg: 'rgba(139, 92, 246, 0.6)', border: 'rgba(139, 92, 246, 1)' },
            'wholesale_100': { bg: 'rgba(16, 185, 129, 0.6)', border: 'rgba(16, 185, 129, 1)' }
          }
          
          setPaymentTypesData({
            labels: paymentTypes.map(p => t(`paymentTypes.${p.type}`)),
            datasets: [{
              data: paymentTypes.map(p => p.total),
              backgroundColor: paymentTypes.map(p => colorMap[p.type]?.bg || 'rgba(100, 100, 100, 0.6)'),
              borderColor: paymentTypes.map(p => colorMap[p.type]?.border || 'rgba(100, 100, 100, 1)'),
              borderWidth: 1
            }]
          })
        }
      } catch (err) {
        console.error('To\'lov turlari ma\'lumotini olishda xatolik:', err)
      }

    } catch (error) {
      console.error(t('sales.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { id: 'home', icon: '🏠', label: t('sales.home') },
    { id: 'orders', icon: '📦', label: t('sales.orders') },
    { id: 'clients', icon: '🏥', label: t('sales.clients') },
    { id: 'payments', icon: '💰', label: t('sales.payments') },
    { id: 'products', icon: '💊', label: t('sales.products') },
    { id: 'reports', icon: '📊', label: t('sales.reports') }
  ]

  const handleNavigate = (view, id = null) => {
    setCurrentView(view)
    if (id) setSelectedId(id)
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sales.dashboard_title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {t('sales.welcome')}, {user.full_name}! | {t('sales.region')}: {user.region || '-'}
                </p>
              </div>
              <Button onClick={fetchSalesReport} variant="outline">
                {t('buttons.refresh')}
              </Button>
            </div>
            
            {/* Shaxsiy KPI kartochkalar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card padding="md" className="border-l-4 border-blue-500 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('sales.my_total_orders')}</p>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{report?.total_orders || 0}</h3>
                  </div>
                  <span className="text-3xl">📦</span>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-green-500 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('sales.my_approved_orders')}</p>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{report?.approved_orders || 0}</h3>
                  </div>
                  <span className="text-3xl">✅</span>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-purple-500 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('sales.my_total_sales')}</p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{formatMoney(report?.total_sales || 0)}</h3>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-red-500 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('sales.my_total_debt')}</p>
                    <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{formatMoney(report?.total_debt || 0)}</h3>
                  </div>
                  <span className="text-3xl">📉</span>
                </div>
              </Card>
            </div>

            {/* ❌ OLIB TASHLANDI: Batafsil statistika kartochkasi */}

            {/* ✅ YANGILANGAN: DIAGRAMMALAR BO'LIMI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Eng ko'p sotilgan mahsulotlar diagrammasi */}
              <Card padding="md" className="dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
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
                            grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                            ticks: { color: '#334155', font: { size: 12, weight: '500' } }
                          },
                          y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                            ticks: {
                              color: '#475569',
                              font: { size: 11 },
                              callback: function(value) { return value.toLocaleString(); }
                            }
                          }
                        }
                      }} 
                    />
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-24">{t('common.loading')}</p>
                  )}
                </div>
              </Card>

              {/* Mijozlar bo'yicha savdo statistikasi (Gorizontal ustunli) */}
              <Card padding="md" className="dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
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
                            grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                            ticks: {
                              color: '#334155',
                              font: { size: 11, weight: '500' },
                              callback: function(value) { return value.toLocaleString() + " " + t('common.currency'); }
                            }
                          },
                          y: {
                            grid: { color: 'rgba(0, 0, 0, 0.03)', drawBorder: false },
                            ticks: { color: '#1e293b', font: { size: 12, weight: '600' } }
                          }
                        }
                      }} 
                    />
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-24">{t('common.loading')}</p>
                  )}
                </div>
              </Card>
            </div>

            {/* ✅ YANGI: To'lov turlari bo'yicha taqsimot (Diagrammalar tagida) */}
            <Card padding="md" className="dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                💳 {t('charts.payment_distribution')}
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
                  <p className="text-center text-gray-500 dark:text-gray-400 mt-24">{t('common.loading')}</p>
                )}
              </div>
            </Card>

          </div>
        )

      case 'orders':
        return <OrderList onNavigate={handleNavigate} readOnly={false} userRole="sales" userRegion={user.region} />
      case 'new-order':
        return <OrderForm onBack={() => handleNavigate('orders')} userRole="sales" userRegion={user.region} isSales={true} />
      case 'edit-order':
        return <OrderForm onBack={() => handleNavigate('orders')} editingOrderId={selectedId} userRole="sales" userRegion={user.region} isSales={true} />
      case 'order-detail':
        return <OrderDetail orderId={selectedId} onBack={() => handleNavigate('orders')} onEdit={(id) => handleNavigate('edit-order', id)} readOnly={false} userRole="sales" />
      case 'clients':
        return <ClientList onNavigate={handleNavigate} readOnly={true} userRegion={user.region} />
      case 'client-detail':
        return <ClientDetail clientId={selectedId} onBack={() => handleNavigate('clients')} readOnly={true} />
      case 'payments':
        return <PaymentList onNavigate={handleNavigate} readOnly={true} userRegion={user.region} />
      case 'payment-detail':
        return <PaymentDetail clientId={selectedId} onBack={() => handleNavigate('payments')} readOnly={true} />
      case 'products':
        return <ProductList onNavigate={handleNavigate} readOnly={true} hideRetailPrice={true} />
      case 'product-detail':
        return <ProductDetail productId={selectedId} onBack={() => handleNavigate('products')} readOnly={true} hideRetailPrice={true} />
      case 'reports':
        return <EmployeeReport employeeId={user.id} onBack={() => handleNavigate('home')} readOnly={true} />
      default:
        return null
    }
  }

  if (loading && currentView === 'home') {
    return <Loading fullScreen text={t('sales.loading')} />
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex transition-colors duration-300">
      <aside className="w-64 bg-white dark:bg-slate-800 shadow-lg flex flex-col transition-colors duration-300">
        <div className="p-6 border-b dark:border-slate-700">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="AIYMAN" className="h-12 w-auto object-contain" />
            <div>
              <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">AIYMED</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('sales.role_title')}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                currentView === item.id 
                  ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-b dark:border-slate-700 relative">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">🌍 {t('dashboard.language_label')}</p>
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 rounded-lg transition text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">{currentLang.flag}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{currentLang.name}</span>
            </span>
            <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showLangDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowLangDropdown(false)} />
              <div className="absolute top-full left-4 right-4 mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-xl z-20 overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition ${
                      i18n.language === lang.code 
                        ? 'bg-blue-50 dark:bg-slate-600 text-blue-700 dark:text-blue-300 font-semibold' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {i18n.language === lang.code && <span className="ml-auto text-blue-600 dark:text-blue-400 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold">
              {user.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('sales.role_name')}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{user.region || '-'}</p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={onLogout} className="w-full">
            {t('dashboard.logout')}
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto dark:text-gray-100 transition-colors duration-300">
        {renderContent()}
      </main>
    </div>
  )
}

export default SalesDashboard