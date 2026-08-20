// frontend/src/components/common/Select.jsx
import { useTranslation } from 'react-i18next' // ✅ Import qo'shildi

function Select({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, // Default qiymatni bu yerdan olib tashladik
  required = false,
  disabled = false
}) {
  const { t } = useTranslation() // ✅ Hook chaqirildi
  
  // Agar placeholder propi berilmagan bo'lsa, default tarjima qiymatini ishlatamiz
  const displayPlaceholder = placeholder || t('common.select')

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <option value="">{displayPlaceholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select