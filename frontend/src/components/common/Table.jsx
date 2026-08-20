// frontend/src/components/common/Table.jsx
import { useTranslation } from 'react-i18next' // ✅ Import qo'shildi

function Table({ columns, data, onRowClick, emptyMessage }) {
  const { t } = useTranslation() // ✅ Hook chaqirildi
  
  // Agar emptyMessage propi berilmagan bo'lsa, default tarjima qiymatini ishlatamiz
  const displayEmptyMessage = emptyMessage || t('common.no_data')

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, colIndex) => (
              <th
                key={colIndex}
                className={`px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                {displayEmptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 text-sm ${column.className || ''}`}>
                    {column.render 
                      ? column.render(row[column.accessor], row, rowIndex) 
                      : row[column.accessor]
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table