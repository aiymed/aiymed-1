// frontend/src/components/director/DirectorDashboard.jsx
import { useState, useEffect } from 'react'
import { orderService } from '../../services/orderService'
import { formatMoney } from '../../utils/format'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'
import Loading from '../common/Loading'

// Admin komponentlarini import qilamiz (ular endi readOnly propini qabul qiladi)
import OrderList from '../admin/orders/OrderList'
import OrderDetail from '../admin/orders/OrderDetail'
import ClientList from '../admin/clients/ClientList'
import ClientDetail from '../admin/clients/ClientDetail'
import PaymentList from '../admin/payments/PaymentList'
import PaymentDetail from '../admin/payments/PaymentDetail'
import EmployeeList from '../admin/employees/EmployeeList'
import EmployeeReport from '../admin/employees/EmployeeReport'
import ProductList from '../admin/products/ProductList'
import ProductDetail from '../admin/products/ProductDetail'
import InventoryList from '../admin/inventory/InventoryList'
import ReportDashboard from '../admin/reports/ReportDashboard'

import { useTranslation } from 'react-i18next'

function DirectorDashboard({ user, onLogout }) {
  const { i18n, t } = useTranslation()
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [currentView, setCurrentView] = useState('home')
  const [selectedId, setSelectedId] = useState(null)

  // Tilni o'zgartirish
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
    setShowLangDropdown(false)
  }

  // Tillar ro'yxati
  const languages = [
    { code: 'uz', flag: '🇺🇿', name: "O'zbek tili" },
    { code: 'ru', flag: '🇷🇺', name: "Русский" },
    { code: 'en', flag: '🇬🇧', name: "English" },
    { code: 'hi', flag: '🇮🇳', name: "हिन्दी" }
  ]

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0]

  useEffect(() => {
    fetchDirectorReport()
  }, [])

  const fetchDirectorReport = async () => {
    setLoading(true)
    try {
      const data = await orderService.getAdminReport()
      setReport(data)
    } catch (error) {
      console.error(t('director.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  // Direktor menyusi (Admin bilan bir xil, lekin faqat ko'rish uchun)
  const menuItems = [
    { id: 'home', icon: '🏠', label: t('director.home') },
    { id: 'orders', icon: '📦', label: t('director.orders') },
    { id: 'clients', icon: '🏥', label: t('director.clients') },
    { id: 'payments', icon: '💰', label: t('director.payments') },
    { id: 'employees', icon: '👥', label: t('director.employees') },
    { id: 'products', icon: '💊', label: t('director.products') },
    { id: 'inventory', icon: '🏭', label: t('director.inventory') },
    { id: 'reports', icon: '📊', label: t('director.reports') }
  ]

  const handleNavigate = (view, id = null) => {
    setCurrentView(view)
    if (id) setSelectedId(id)
  }

  // Content render qilish
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{t('director.dashboard_title')}</h1>
                <p className="text-gray-500 mt-1">{t('director.dashboard_subtitle')}</p>
              </div>
              <Button onClick={fetchDirectorReport} variant="outline">
                {t('buttons.refresh')}
              </Button>
            </div>

            {/* KPI kartochkalar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card padding="md" className="border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{t('director.total_orders')}</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{report?.total_orders || 0}</h3>
                  </div>
                  <span className="text-3xl">📦</span>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{t('director.approved_orders')}</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{report?.approved_orders || 0}</h3>
                  </div>
                  <span className="text-3xl">✅</span>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{t('director.total_sales')}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">{formatMoney(report?.total_sales || 0)}</h3>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-red-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{t('director.total_debt')}</p>
                    <h3 className="text-2xl font-bold text-red-600 mt-2">{formatMoney(report?.total_debt || 0)}</h3>
                  </div>
                  <span className="text-3xl">📉</span>
                </div>
              </Card>
            </div>
           
            {/* Qo'shimcha statistika */}
            <Card padding="md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">{t('director.additional_stats')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800 font-medium">{t('director.pending_orders')}</p>
                  <p className="text-2xl font-bold text-yellow-700 mt-1">{report?.pending_orders || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-800 font-medium">{t('director.rejected_orders')}</p>
                  <p className="text-2xl font-bold text-gray-700 mt-1">{report?.rejected_orders || 0}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">{t('director.total_products')}</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">-</p>
                </div>
              </div>
            </Card>
          </div>
        )

      // ✅ MUHIM: Barcha komponentlarga readOnly={true} berilmoqda!
      case 'orders':
        return <OrderList onNavigate={handleNavigate} readOnly={true} />

      case 'order-detail':
        return <OrderDetail orderId={selectedId} onBack={() => handleNavigate('orders')} readOnly={true} />

      case 'clients':
        return <ClientList onNavigate={handleNavigate} readOnly={true} />

      case 'client-detail':
        return <ClientDetail clientId={selectedId} onBack={() => handleNavigate('clients')} readOnly={true} />

      case 'payments':
        return <PaymentList onNavigate={handleNavigate} readOnly={true} />

      case 'payment-detail':
        return <PaymentDetail clientId={selectedId} onBack={() => handleNavigate('payments')} readOnly={true} />

      case 'employees':
        return <EmployeeList onNavigate={handleNavigate} readOnly={true} />

      case 'employee-report':
        return <EmployeeReport employeeId={selectedId} onBack={() => handleNavigate('employees')} readOnly={true} />

      case 'products':
        return <ProductList onNavigate={handleNavigate} readOnly={true} />

      case 'product-detail':
        return <ProductDetail productId={selectedId} onBack={() => handleNavigate('products')} readOnly={true} />

      case 'inventory':
        return <InventoryList onNavigate={handleNavigate} readOnly={true} />

      case 'reports':
        return <ReportDashboard /> // ReportDashboard tabiatan read-only

      default:
        return null
    }
  }

  if (loading && currentView === 'home') {
    return <Loading fullScreen text={t('director.loading')} />
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo va sarlavha */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="AIYMAN" 
              className="h-12 w-auto object-contain"
            />
            <div>
              <h2 className="text-xl font-bold text-blue-600">AIYMED</h2>
              <p className="text-xs text-gray-500 mt-0.5">{t('director.role_title')}</p>
            </div>
          </div>
        </div>
        
        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                currentView === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Til tanlash */}
        <div className="p-4 border-b relative">
          <p className="text-xs text-gray-500 mb-2 font-medium">🌍 {t('dashboard.language_label')}</p>
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">{currentLang.flag}</span>
              <span className="font-medium text-gray-800">{currentLang.name}</span>
            </span>
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showLangDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowLangDropdown(false)}
              />
              <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition ${
                      i18n.language === lang.code
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {i18n.language === lang.code && (
                      <span className="ml-auto text-blue-600 font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Foydalanuvchi ma'lumotlari */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
              {user.full_name?.charAt(0) || 'D'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{user.full_name}</p>
              <p className="text-xs text-gray-500">{t('director.role_name')}</p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={onLogout} className="w-full">
            {t('dashboard.logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  )
}

export default DirectorDashboard