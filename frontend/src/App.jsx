// frontend/src/App.jsx
import { useState, useEffect } from 'react'
import Login from './components/Login'
import AdminDashboard from './components/admin/AdminDashboard'
import DirectorDashboard from './components/director/DirectorDashboard' // ✅ YANGI IMPORT
import MarketingDashboard from './components/marketing/MarketingDashboard'
import SalesDashboard from './components/sales/SalesDashboard'

function App() {
  // localStorage'dan user ma'lumotlarini o'qish
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  // User o'zgarganda localStorage'ga saqlash
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
      localStorage.removeItem('language') // Chiqishda tilni ham tozalash (ixtiyoriy)
    }
  }, [user])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  // 1. Agar foydalanuvchi login qilmagan bo'lsa -> Login sahifasi
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  // 2. Agar foydalanuvchi ADMIN bo'lsa -> Admin Dashboard
  if (user.role === 'admin') {
    return (
      <AdminDashboard 
        user={user} 
        onLogout={handleLogout} 
      />
    )
  }

  // 3. ✅ YANGI: Agar foydalanuvchi DIREKTOR bo'lsa -> Director Dashboard
  if (user.role === 'director') {
    return (
      <DirectorDashboard 
        user={user} 
        onLogout={handleLogout} 
      />
    )
  }

  // 4. Boshqa rollar uchun (Marketing, Sales va h.k. - kelajakda kengaytiriladi)
  if (user.role === 'marketing') {
    return (
      <MarketingDashboard 
        user={user} 
        onLogout={handleLogout} 
      />
    )
  }

  if (user.role === 'sales') {
    return (
      <SalesDashboard 
        user={user} 
        onLogout={handleLogout} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {user.role === 'sales' ? 'Savdo Vakili' : user.role === 'marketing' ? 'Marketing Menejeri' : 'Foydalanuvchi'} Paneli
        </h1>
        <p className="text-gray-600 mb-6">
          Hurmatli {user.full_name}, sizning panelingiz hozircha ishlab chiqilmoqda.
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition font-semibold w-full"
        >
          Tizimdan chiqish
        </button>
      </div>
    </div>
  )
}

export default App