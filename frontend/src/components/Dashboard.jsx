import Clients from './Clients'
import Products from './Products'
import Orders from './Orders'
import Report from './Report'
import { useState } from 'react'

function Dashboard({ user, onLogout }) {
  // Hozircha oddiy menyu tanlovi
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* 1. Yon panel (Sidebar) - Kompyuter uchun */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg p-6">
        <h2 className="text-2xl font-bold text-primary mb-8">AIYMED</h2>
        <nav className="flex-1 space-y-4">
          <button 
            onClick={() => setActiveTab('home')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === 'home' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            🏠 Bosh sahifa
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            📦 Buyurtmalar
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === 'clients' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
             Mijozlar
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === 'products' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            💊 Ombor
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === 'report' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
             Hisobot
          </button>
        </nav>
        <button 
          onClick={onLogout}
          className="mt-auto bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition"
        >
          Chiqish
        </button>
      </aside>

      {/* 2. Asosiy qism */}
      <main className="flex-1 flex flex-col">
        {/* Yuqori panel (Header) - Mobil uchun */}
        <header className="bg-white shadow p-4 flex justify-between items-center md:hidden">
          <h2 className="text-xl font-bold text-primary">AIYMED</h2>
          <button 
            onClick={onLogout}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Chiqish
          </button>
        </header>

        {/* Sahifa mazmuni */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h1 className="text-2xl font-bold mb-4">Xush kelibsiz, {user.foydalanuvchi}!</h1>
              <p className="text-gray-600">Sizning roliingiz: <span className="font-bold text-primary">{user.rol}</span></p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-800">Buyurtmalar</h3>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-800">Tasdiqlangan</h3>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-bold text-yellow-800">Qarzdorlik</h3>
                  <p className="text-2xl font-bold text-yellow-600">0 so'm</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && <Orders />}
          {activeTab === 'clients' && <Clients />}
          {activeTab === 'products' && <Products />}
          {activeTab === 'report' && <Report user={user} />}
        </div>

        {/* 3. Pastki navigatsiya (Bottom Nav) - Faqat Mobil uchun */}
        <nav className="md:hidden bg-white shadow-lg border-t flex justify-around p-3">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="text-xl"></span>
            <span className="text-xs">Bosh sahifa</span>
          </button>
          <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center ${activeTab === 'orders' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="text-xl">📦</span>
            <span className="text-xs">Buyurtmalar</span>
          </button>
          <button onClick={() => setActiveTab('clients')} className={`flex flex-col items-center ${activeTab === 'clients' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="text-xl">🏥</span>
            <span className="text-xs">Mijozlar</span>
          </button>
          <button onClick={() => setActiveTab('products')} className={`flex flex-col items-center ${activeTab === 'products' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="text-xl">💊</span>
            <span className="text-xs">Ombor</span>
          </button>
          <button onClick={() => setActiveTab('report')} className={`flex flex-col items-center ${activeTab === 'report' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="text-xl">📊</span>
            <span className="text-xs">Hisobot</span>
          </button>
        </nav>
      </main>
    </div>
  )
}

export default Dashboard