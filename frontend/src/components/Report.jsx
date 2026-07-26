import { useState, useEffect } from 'react'

function Report({ user }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      // Hozircha user_id=1 (admin), keyin tokendan olamiz
      const response = await fetch('http://127.0.0.1:8000/orders/report/1')
      if (response.ok) {
        const data = await response.json()
        setReport(data)
      }
    } catch (error) {
      console.error('Xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>
  }

  if (!report) {
    return <div className="text-center py-8 text-gray-500">Hisobot ma'lumotlari topilmadi</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Hisobot - {report.month}</h2>

      {/* Statistika kartochkalari */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Umumiy buyurtmalar */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Umumiy buyurtmalar</p>
              <p className="text-3xl font-bold text-gray-900">{report.total_orders}</p>
            </div>
            <div className="text-4xl text-blue-500">📦</div>
          </div>
        </div>

        {/* Tasdiqlangan */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tasdiqlangan</p>
              <p className="text-3xl font-bold text-green-600">{report.approved_orders}</p>
            </div>
            <div className="text-4xl text-green-500">✅</div>
          </div>
        </div>

        {/* Umumiy savdo */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Umumiy savdo</p>
              <p className="text-2xl font-bold text-purple-600">{report.total_sales.toLocaleString()} so'm</p>
            </div>
            <div className="text-4xl text-purple-500">💰</div>
          </div>
        </div>

        {/* Qarzdorlik */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Qarzdorlik</p>
              <p className="text-2xl font-bold text-yellow-600">{report.total_debt.toLocaleString()} so'm</p>
            </div>
            <div className="text-4xl text-yellow-500">⚠️</div>
          </div>
        </div>
      </div>

      {/* Qo'shimcha ma'lumotlar */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Batafsil ma'lumot</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Kutilayotgan buyurtmalar:</span>
            <span className="font-bold text-yellow-600">{report.pending_orders} ta</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Tasdiqlangan buyurtmalar:</span>
            <span className="font-bold text-green-600">{report.approved_orders} ta</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Umumiy savdo summasi:</span>
            <span className="font-bold text-purple-600">{report.total_sales.toLocaleString()} so'm</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">Qolgan qarzdorlik:</span>
            <span className="font-bold text-yellow-600">{report.total_debt.toLocaleString()} so'm</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Report