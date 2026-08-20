// frontend/src/components/common/LogoLoader.jsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function LogoLoader() {
  const { t } = useTranslation()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // 100ms dan keyin animatsiyani boshlash
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Logo konteyner */}
      <div className="relative w-48 h-48 mb-8">
        {/* SVG Logo - Original logotipga moslashtirilgan */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ASOSIY X SHAKLI - 5 ta katta kvadrat */}
          
          {/* 1. Yuqori markaziy ko'k kvadrat */}
          <rect
            x="75"
            y="20"
            width="50"
            height="50"
            rx="8"
            fill="url(#gradient1)"
            className={`transition-all duration-700 ease-out ${
              animate ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 -translate-x-10 -translate-y-10'
            }`}
            style={{ transitionDelay: '0ms' }}
          />

          {/* 2. Chap markaziy ko'k kvadrat */}
          <rect
            x="20"
            y="75"
            width="50"
            height="50"
            rx="8"
            fill="url(#gradient2)"
            className={`transition-all duration-700 ease-out ${
              animate ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 -translate-x-10 translate-y-0'
            }`}
            style={{ transitionDelay: '100ms' }}
          />

          {/* 3. Markaziy pushti kvadrat */}
          <rect
            x="75"
            y="75"
            width="50"
            height="50"
            rx="8"
            fill="url(#gradient3)"
            className={`transition-all duration-700 ease-out ${
              animate ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : 'opacity-0 translate-x-0 translate-y-0 scale-0'
            }`}
            style={{ transitionDelay: '200ms' }}
          />

          {/* 4. O'ng markaziy ko'k kvadrat */}
          <rect
            x="130"
            y="75"
            width="50"
            height="50"
            rx="8"
            fill="url(#gradient4)"
            className={`transition-all duration-700 ease-out ${
              animate ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-10 translate-y-0'
            }`}
            style={{ transitionDelay: '300ms' }}
          />

          {/* 5. Pastki markaziy ko'k kvadrat */}
          <rect
            x="75"
            y="130"
            width="50"
            height="50"
            rx="8"
            fill="url(#gradient5)"
            className={`transition-all duration-700 ease-out ${
              animate ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-0 translate-y-10'
            }`}
            style={{ transitionDelay: '400ms' }}
          />

          {/* O'NG YUQORI BURCHAK - 4 ta kichik kvadrat (2x2 grid) */}
          
          {/* 6. Yuqori chap kichik ko'k kvadrat */}
          <rect
            x="140"
            y="13"
            width="22"
            height="22"
            rx="5"
            fill="url(#gradient6)"
            className={`transition-all duration-700 ease-out ${
              animate ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-10 -translate-y-10'
            }`}
            style={{ transitionDelay: '500ms' }}
          />

          {/* 7. Yuqori o'ng kichik pushti kvadrat */}
          <rect
            x="170"
            y="13"
            width="20"
            height="20"
            rx="5"
            fill="url(#gradient7)"
            className={`transition-all duration-700 ease-out ${
              animate ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-10 -translate-y-10'
            }`}
            style={{ transitionDelay: '600ms' }}
          />

          {/* 8. Pastki chap kichik pushti kvadrat */}
          <rect
            x="135"
            y="40"
            width="30"
            height="30"
            rx="5"
            fill="url(#gradient8)"
            className={`transition-all duration-700 ease-out ${
              animate ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-10 translate-y-10'
            }`}
            style={{ transitionDelay: '700ms' }}
          />

          {/* 9. Pastki o'ng kichik ko'k kvadrat */}
          <rect
            x="170"
            y="40"
            width="22"
            height="22"
            rx="5"
            fill="url(#gradient9)"
            className={`transition-all duration-700 ease-out ${
              animate ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-10 translate-y-10'
            }`}
            style={{ transitionDelay: '800ms' }}
          />

          {/* Gradientlar */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="gradient7" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="gradient8" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="gradient9" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* AIYMAN yozuvi - harflar alohida animatsiya */}
      <div className="flex gap-1 text-4xl font-bold">
        {['A', 'I', 'Y', 'M', 'A', 'N'].map((letter, index) => (
          <span
            key={index}
            className={`inline-block transition-all duration-500 ease-out ${
              animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{
              transitionDelay: `${900 + index * 100}ms`,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Yuklanmoqda yozuvi */}
      <div
        className={`mt-6 text-gray-500 text-sm transition-all duration-500 ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '1600ms' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          <span className="ml-2">{t('common.loading')}</span>
        </div>
      </div>
    </div>
  )
}

export default LogoLoader