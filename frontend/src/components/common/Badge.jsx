// frontend/src/components/common/Badge.jsx

function Badge({ text, color = 'bg-gray-100 text-gray-800', size = 'sm' }) {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-1.5 text-base',
    lg: 'px-6 py-2 text-lg'
  }

  return (
    <span className={`${sizeClasses[size]} font-bold rounded ${color}`}>
      {text}
    </span>
  )
}

export default Badge