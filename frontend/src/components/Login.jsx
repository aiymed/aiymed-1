// frontend/src/components/Login.jsx
import { useState } from 'react'
import { authService } from '../services/authService'
import { useTranslation } from 'react-i18next'
import LogoLoader from './common/LogoLoader' // ✅ 1-YANGI: LogoLoader import qilindi

function Login({ onLogin }) {
  const { i18n, t } = useTranslation()
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  // Joriy til
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const startTime = Date.now() // ✅ 2-YANGI: Vaqtni boshlash
    
    try {
      const data = await authService.login(email, password)
      
      console.log("Backend javobi:", data)
      console.log("Javob turlari:", typeof data)
      console.log("Javob kalitlari:", Object.keys(data))
      
      let userData = null
      
      if (data.user) {
        userData = data.user
        console.log("✅ Format 1: data.user orqali")
      } else if (data.email || data.full_name || data.role) {
        userData = data
        console.log("✅ Format 2: To'g'ridan-to'g'ri user obyekti")
      } else if (data.data && data.data.user) {
        userData = data.data.user
        console.log("✅ Format 3: data.data.user orqali")
      } else {
        console.error("❌ Noma'lum format! Javob:", JSON.stringify(data))
        setError(t('login.debug_user_not_found'))
        return
      }
      
      console.log("✅ Foydalanilayotgan user:", userData)
      
      // ✅ 3-YANGI: Kamida 4 soniya (4000 ms) animatsiya ko'rinishini ta'minlash
      const elapsedTime = Date.now() - startTime
      const minDisplayTime = 4000 // 4 soniya (5 soniya xohlasangiz 5000 qiling)
      
      if (elapsedTime < minDisplayTime) {
        const timeToWait = minDisplayTime - elapsedTime
        await new Promise(resolve => setTimeout(resolve, timeToWait))
      }

      onLogin(userData)
    } catch (err) {
      console.error("❌ Login xatosi:", err)
      setError(err.message || t('login.error_message'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      
      {/* ✅ 4-YANGI: Loading holatida aynan shu animatsiya butun ekranni qoplaydi (z-50 tufayli) */}
      {loading && <LogoLoader />}

      {/* ✅ O'ng yuqori burchakda Til tanlash */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative">
          {/* Til tanlash tugmasi */}
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition text-sm font-medium"
          >
            <span className="text-xl">{currentLang.flag}</span>
            <span className="text-gray-700">{currentLang.name}</span>
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown ro'yxat */}
          {showLangDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowLangDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
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
      </div>

      {/* ✅ Markazda Login formasi */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          {/* Logo va sarlavha */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/logo.png" 
                alt="AIYMAN" 
                className="h-16 w-auto object-contain"
              />
              <h1 className="text-3xl font-bold text-blue-600">AIYMED</h1>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{t('login.title')}</h2>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.email_label')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={t('login.email_placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.password_label')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={t('login.password_placeholder')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-600/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('login.logging_in')}
                </span>
              ) : (
                t('login.login_button')
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-sm text-gray-500">
        © 2026 AIYMAN. {t('login.footer_text') || 'Barcha huquqlar himoyalangan'}
      </div>
    </div>
  )
}

export default Login