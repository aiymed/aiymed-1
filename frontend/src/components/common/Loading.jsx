// frontend/src/components/common/Loading.jsx
import LogoLoader from './LogoLoader'

function Loading({ fullScreen = false, text = 'Yuklanmoqda...' }) {
  // Agar fullScreen bo'lsa, LogoLoader ishlatamiz
  if (fullScreen) {
    return <LogoLoader />
  }

  // Aks holda oddiy loading
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600">{text}</span>
      </div>
    </div>
  )
}

export default Loading