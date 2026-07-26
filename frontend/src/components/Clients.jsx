import { useState, useEffect } from 'react'

function Clients() {
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    inn: ''
  })

  // Mijozlarni yuklash
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('https://taunt-pantry-marlin.ngrok-free.dev/clients/')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Xatolik:', error)
    }
  }

  // Yangi mijoz qo'shish
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('https://taunt-pantry-marlin.ngrok-free.dev/clients/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Formani tozalash va yopish
        setFormData({ name: '', address: '', phone: '', inn: '' })
        setShowForm(false)
        // Ro'yxatni yangilash
        fetchClients()
        alert('Mijoz muvaffaqiyatli qo\'shildi!')
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
        <h2 className="text-2xl font-bold text-gray-800">Mijozlar (Kontragentlar)</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? ' Bekor qilish' : '+ Yangi mijoz'}
        </button>
      </div>

      {/* Yangi mijoz qo'shish formasi */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-bold mb-4">Yangi mijoz qo'shish</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nomi *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Masalan: Toshkent Med Farm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Manzil
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Manzilni kiriting"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+998901234567"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  INN (STIR)
                </label>
                <input
                  type="text"
                  value={formData.inn}
                  onChange={(e) => setFormData({...formData, inn: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="123456789"
                />
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

      {/* Mijozlar ro'yxati */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Hali mijozlar yo'q. Birinchi mijozni qo'shing!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">№</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Nomi</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase hidden md:table-cell">Manzil</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase hidden md:table-cell">Telefon</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase hidden lg:table-cell">INN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client, index) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{client.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{client.address || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{client.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{client.inn || '-'}</td>
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

export default Clients