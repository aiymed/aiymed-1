import { useState, useEffect } from 'react'

function Products() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    unit: 'dona'
  })

  // Mahsulotlarni yuklash
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://taunt-pantry-marlin.ngrok-free.dev/products/')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Xatolik:', error)
    }
  }

  // Yangi mahsulot qo'shish
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('https://taunt-pantry-marlin.ngrok-free.dev/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity)
        })
      })

      if (response.ok) {
        // Formani tozalash va yopish
        setFormData({ name: '', description: '', price: '', stock_quantity: '', unit: 'dona' })
        setShowForm(false)
        // Ro'yxatni yangilash
        fetchProducts()
        alert('Mahsulot muvaffaqiyatli qo\'shildi!')
      } else {
        alert('Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Xatolik:', error)
      alert('Serverga ulanishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ombor (Mahsulotlar)</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? ' Bekor qilish' : '+ Yangi mahsulot'}
        </button>
      </div>

      {/* Yangi mahsulot qo'shish formasi */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-bold mb-4">Yangi mahsulot qo'shish</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Mahsulot nomi *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Masalan: Paracetamol 500mg"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Tavsif
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Qisqacha tavsif"
                rows="2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Narxi (so'm) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Omborda (soni) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  O'lchov birligi
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="dona">dona</option>
                  <option value="quti">quti</option>
                  <option value="flakon">flakon</option>
                  <option value="upak">upak</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </form>
        </div>
      )}

      {/* Mahsulotlar ro'yxati */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Hali mahsulotlar yo'q. Birinchi mahsulotni qo'shing!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">№</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Mahsulot</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase hidden md:table-cell">Tavsif</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Narxi</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Omborda</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase hidden lg:table-cell">Birligi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                      {product.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">
                      {parseFloat(product.price).toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        product.stock_quantity > 100 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock_quantity > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock_quantity} dona
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                      {product.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products