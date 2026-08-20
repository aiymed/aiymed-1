// frontend/src/components/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { orderService } from '../../services/orderService'
import { formatMoney } from '../../utils/format'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'
import Loading from '../common/Loading'
import OrderList from './orders/OrderList'
import OrderForm from './orders/OrderForm'
import OrderDetail from './orders/OrderDetail'
import ClientList from './clients/ClientList'
import ClientForm from './clients/ClientForm'
import ClientDetail from './clients/ClientDetail'
import PaymentList from './payments/PaymentList'
import PaymentForm from './payments/PaymentForm'
import PaymentDetail from './payments/PaymentDetail'
import EmployeeList from './employees/EmployeeList'
import EmployeeForm from './employees/EmployeeForm'
import EmployeeReport from './employees/EmployeeReport'
import ProductList from './products/ProductList'
import ProductForm from './products/ProductForm'
import ProductDetail from './products/ProductDetail'
import InventoryList from './inventory/InventoryList'
import ReportDashboard from './reports/ReportDashboard'
import { useTranslation } from 'react-i18next'

function AdminDashboard({ user, onLogout }) {
  const { i18n, t } = useTranslation()
  
  // ✅ YANGI: Dropdown ochiq/yopiq holatini boshqarish
  const [showLangDropdown, setShowLangDropdown] = useState(false)

  // Tilni localStorage'dan yuklash
  useEffect(() => {
    const savedLang = localStorage.getItem('language')
    if (savedLang && ['uz', 'ru', 'en', 'hi'].includes(savedLang)) {
      i18n.changeLanguage(savedLang)
    }
  }, [])

  // Tilni o'zgartirish funksiyasi
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
    setShowLangDropdown(false) // ✅ Til tanlangandan so'ng dropdownni yopish
  }

  // ✅ YANGI: Tillar ro'yxati
  const languages = [
    { code: 'uz', flag: '🇺🇿', name: "O'zbek tili" },
    { code: 'ru', flag: '🇷🇺', name: "Русский" },
    { code: 'en', flag: '🇬🇧', name: "English" },
    { code: 'hi', flag: '🇮🇳', name: "हिन्दी" }
  ]

  // Joriy tanlangan tilni topish
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0]

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [currentView, setCurrentView] = useState('home')
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  useEffect(() => {
    fetchAdminReport()
  }, [])

  const fetchAdminReport = async () => {
    setLoading(true)
    try {
      const data = await orderService.getAdminReport()
      setReport(data)
    } catch (error) {
      console.error(t('dashboard.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { id: 'home', icon: '🏠', label: t('navigation.home') },
    { id: 'orders', icon: '📦', label: t('navigation.orders') },
    { id: 'clients', icon: '🏥', label: t('navigation.clients') },
    { id: 'payments', icon: '💰', label: t('navigation.payments') },
    { id: 'employees', icon: '👥', label: t('navigation.employees') },
    { id: 'products', icon: '💊', label: t('navigation.products') },
    { id: 'inventory', icon: '🏭', label: t('navigation.inventory') },
    { id: 'reports', icon: '📊', label: t('navigation.reports') }
  ]

  const handleNavigate = (view, orderId = null) => {
    setCurrentView(view)
    if (orderId) setSelectedOrderId(orderId)
  }

  // Content render qilish
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>
                <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
              </div>
              <Button onClick={fetchAdminReport} variant="outline">
                {t('buttons.refresh')}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card padding="md" className="border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{t('dashboard.total_orders')}</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{report?.total_orders || 0}</h3>
                  </div>
                  <span className="text-3xl">📦</span>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{t('dashboard.approved')}</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{report?.approved_orders || 0}</h3>
                  </div>
                  <span className="text-3xl">✅</span>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{t('dashboard.total_sales')}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">{formatMoney(report?.total_sales || 0)}</h3>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-red-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{t('dashboard.total_debt')}</p>
                    <h3 className="text-2xl font-bold text-red-600 mt-2">{formatMoney(report?.total_debt || 0)}</h3>
                  </div>
                  <span className="text-3xl">📉</span>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card padding="md">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{t('dashboard.quick_actions')}</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" onClick={() => handleNavigate('new-order')}>
                    {t('buttons.new_order')}
                  </Button>
                  <Button variant="success" onClick={() => handleNavigate('clients')}>
                    {t('buttons.new_client')}
                  </Button>
                  <Button variant="warning" onClick={() => handleNavigate('payments')}>
                    {t('buttons.add_payment')}
                  </Button>
                </div>
              </Card>

              <Card padding="md">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{t('dashboard.system_status')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700 font-medium">{t('dashboard.backend_server')}</span>
                    <Badge text={t('dashboard.running')} color="bg-green-100 text-green-800" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 font-medium">{t('dashboard.frontend_app')}</span>
                    <Badge text={t('dashboard.running')} color="bg-blue-100 text-blue-800" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )

      case 'orders':
        return <OrderList onNavigate={handleNavigate} />

      case 'new-order':
        return <OrderForm onBack={() => handleNavigate('orders')} />

      case 'edit-order':
        return <OrderForm onBack={() => handleNavigate('orders')} editingOrderId={selectedOrderId} />

      case 'order-detail':
        return <OrderDetail orderId={selectedOrderId} onBack={() => handleNavigate('orders')} onEdit={(id) => handleNavigate('edit-order', id)} />

      case 'clients':
        return <ClientList onNavigate={handleNavigate} />

      case 'new-client':
        return <ClientForm onBack={() => handleNavigate('clients')} />

      case 'edit-client':
        return <ClientForm onBack={() => handleNavigate('clients')} editingClientId={selectedOrderId} />

      case 'client-detail':
        return <ClientDetail clientId={selectedOrderId} onBack={() => handleNavigate('clients')} onEdit={(id) => handleNavigate('edit-client', id)} />

      case 'payments':
        return <PaymentList onNavigate={handleNavigate} />

      case 'new-payment':
        return <PaymentForm onBack={() => handleNavigate('payments')} />

      case 'payment-detail':
        return <PaymentDetail clientId={selectedOrderId} onBack={() => handleNavigate('payments')} />

      case 'employees':
        return <EmployeeList onNavigate={handleNavigate} />

      case 'new-employee':
        return <EmployeeForm onBack={() => handleNavigate('employees')} />

      case 'edit-employee':
        return <EmployeeForm onBack={() => handleNavigate('employees')} editingEmployeeId={selectedOrderId} />

      case 'employee-report':
        return <EmployeeReport employeeId={selectedOrderId} onBack={() => handleNavigate('employees')} />

      case 'products':
        return <ProductList onNavigate={handleNavigate} />

      case 'new-product':
        return <ProductForm onBack={() => handleNavigate('products')} />

      case 'edit-product':
        return <ProductForm onBack={() => handleNavigate('products')} editingProductId={selectedOrderId} />
      
      case 'product-detail':
        return <ProductDetail productId={selectedOrderId} onBack={() => handleNavigate('products')} onEdit={(id) => handleNavigate('edit-product', id)} />
      
      case 'inventory':
        return <InventoryList onNavigate={handleNavigate} />

      case 'reports':
        return <ReportDashboard />
        
      default:
        return null
    }
  }

  if (loading && currentView === 'home') {
    return <Loading fullScreen text={t('dashboard.loading')} />
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
              <p className="text-xs text-gray-500 mt-0.5">{t('dashboard.admin_panel')}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                currentView === item.id || (item.id === 'orders' && ['orders', 'new-order', 'edit-order', 'order-detail'].includes(currentView))
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* ✅ YANGI: Til tanlash - Dropdown (Ixcham) */}
        <div className="p-4 border-b relative">
          <p className="text-xs text-gray-500 mb-2 font-medium">🌍 {t('dashboard.language_label')}</p>
          
          {/* Asosiy tugma (Joriy tilni ko'rsatadi) */}
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">{currentLang.flag}</span>
              <span className="font-medium text-gray-800">{currentLang.name}</span>
            </span>
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showLangDropdown ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Ochiladigan Dropdown menyusi */}
          {showLangDropdown && (
            <>
              {/* Tashqariga bosganda yopish uchun fon */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowLangDropdown(false)}
              />
              {/* Dropdown ro'yxati */}
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

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              {user.full_name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{user.full_name}</p>
              <p className="text-xs text-gray-500">{t('dashboard.main_admin')}</p>
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

export default AdminDashboard