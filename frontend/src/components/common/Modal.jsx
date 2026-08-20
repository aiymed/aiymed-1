// frontend/src/components/common/Modal.jsx
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next' // ✅ Import qo'shildi

function Modal({ title, children, onClose, className = '' }) {
  const { t } = useTranslation() // ✅ Hook chaqirildi

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {title && (
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              aria-label={t('buttons.close')} // ✅ Ekran o'quvchilar uchun qo'shildi
              title={t('buttons.close')} // ✅ Hover qilganda ham ko'rinadi
            >
              ×
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal