import { useState, useEffect } from 'react'

function Orders() {
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form ma'lumotlari
  const [formData, setFormData] = useState({
    client_id: '',
    payment_type: 50,
    items: []
  })
  
  // Yangi mahsulot qo'shish uchun
  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 1,
    price: 0,
    product_name: '',
    unit: 'dona'
  })

  // Ma'lumotlarni yuklash
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clientsRes, productsRes, ordersRes] = await Promise.all([
        fetch('https://taunt-pantry-marlin.ngrok-free.dev/clients/'),
        fetch('https://taunt-pantry-marlin.ngrok-free.dev/products/'),
        fetch('https://taunt-pantry-marlin.ngrok-free.dev/orders/')
      ])
      
      if (clientsRes.ok) setClients(await clientsRes.json())
      if (productsRes.ok) setProducts(await productsRes.json())
      if (ordersRes.ok) setOrders(await ordersRes.json())
    } catch (error) {
      console.error('Xatolik:', error)
    }
  }

  // Mahsulotni tanlash
  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    if (product) {
      setNewItem({
        product_id: product.id,
        quantity: 1,
        price: product.price,
        product_name: product.name,
        unit: product.unit
      })
    }
  }

  // Mahsulotni buyurtmaga qo'shish
  const addItemToOrder = () => {
    if (!newItem.product_id || !newItem.quantity) {
      alert('Mahsulot va sonini tanlang')
      return
    }
    
    setFormData({
      ...formData,
      items: [...formData.items, { ...newItem, id: Date.now() }]
    })
    
    // Formani tozalash
    setNewItem({ product_id: '', quantity: 1, price: 0, product_name: '', unit: 'dona' })
  }

  // Buyurtmadan mahsulotni o'chirish
  const removeItem = (id) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id)
    })
  }

  // Umumiy summani hisoblash
  const calculateTotals = () => {
    const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const vat = total * 12 / 112 // QQS 12%
    const prepayment = total * (formData.payment_type / 100)
    const remaining = total - prepayment
    
    return { total, vat, prepayment, remaining }
  }

  // Buyurtma yaratish
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.client_id) {
      alert('Mijozni tanlang')
      return
    }
    
    if (formData.items.length === 0) {
      alert('Kamida bitta mahsulot qo\'shing')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('https://taunt-pantry-marlin.ngrok-free.dev/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: parseInt(formData.client_id),
          payment_type: formData.payment_type,
          user_id: 1, // Hozircha admin ID=1, keyin tokendan olamiz
          items: formData.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            product_name: item.product_name,
            unit: item.unit
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Buyurtma muvaffaqiyatli yaratildi! ID: ${data.order_id}`)
        setShowForm(false)
        setFormData({ client_id: '', payment_type: 50, items: [] })
        fetchData()
      } else {
        const error = await response.json()
        alert(`Xatolik: ${error.detail}`)
      }
    } catch (error) {
      console.error('Xatolik:', error)
      alert('Serverga ulanishda xatolik')
    } finally {
      setLoading(false)
    }
  }

    // Buyurtma holatini o'zgartirish (Tasdiqlash yoki Rad etish)
  const handleStatusChange = async (orderId, newStatus) => {
    const actionText = newStatus === 'approved' ? 'tasdiqlash' : 'rad etish';
    if (!window.confirm(`Buyurtmani ${actionText}ga ishonchingiz komilmi?`)) return;

    try {
      const response = await fetch(`https://taunt-pantry-marlin.ngrok-free.dev/orders/${orderId}/status?status=${newStatus}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        alert(`Buyurtma muvaffaqiyatli ${actionText}ildi!`);
        fetchData(); // Ro'yxatni yangilash
      } else {
        const error = await response.json();
        alert(`Xatolik: ${error.detail}`);
      }
    } catch (error) {
      console.error('Xatolik:', error);
      alert('Serverga ulanishda xatolik');
    }
  }

  const totals = calculateTotals()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Buyurtmalar</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? ' Bekor qilish' : '+ Yangi buyurtma'}
        </button>
      </div>

      {/* Yangi buyurtma formasi */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-bold mb-4">Yangi buyurtma yaratish</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mijoz va to'lov turi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Mijoz *
                </label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Mijozni tanlang</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  To'lov turi
                </label>
                <select
                  value={formData.payment_type}
                  onChange={(e) => setFormData({...formData, payment_type: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={30}>30% oldindan</option>
                  <option value={50}>50% oldindan</option>
                  <option value={100}>100% to'liq to'lov</option>
                </select>
              </div>
            </div>

            {/* Mahsulot qo'shish */}
            <div className="border-t pt-4">
              <h4 className="font-bold mb-3">Mahsulotlar qo'shish</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <select
                    value={newItem.product_id}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Mahsulot tanlang</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.price.toLocaleString()} so'm)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Soni"
                  />
                </div>

                <button
                  type="button"
                  onClick={addItemToOrder}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  + Qo'shish
                </button>
              </div>
            </div>

            {/* Tanlangan mahsulotlar ro'yxati */}
            {formData.items.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold mb-2">Tanlangan mahsulotlar:</h4>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600">
                      <th>№</th>
                      <th>Mahsulot</th>
                      <th>Soni</th>
                      <th>Narxi</th>
                      <th>Summa</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={item.id} className="border-t">
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2">{item.product_name}</td>
                        <td className="py-2">{item.quantity}</td>
                        <td className="py-2">{item.price.toLocaleString()} so'm</td>
                        <td className="py-2 font-bold">{(item.quantity * item.price).toLocaleString()} so'm</td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Hisobot */}
            {formData.items.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold mb-2 text-blue-800">Hisob-kitob:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Umumiy summa:</div>
                  <div className="font-bold text-right">{totals.total.toLocaleString()} so'm</div>
                  
                  <div>QQS (12%):</div>
                  <div className="text-right">{totals.vat.toLocaleString()} so'm</div>
                  
                  <div>Oldindan to'lov ({formData.payment_type}%):</div>
                  <div className="font-bold text-green-600 text-right">{totals.prepayment.toLocaleString()} so'm</div>
                  
                  <div>Qolgan qarz:</div>
                  <div className="font-bold text-yellow-600 text-right">{totals.remaining.toLocaleString()} so'm</div>
                </div>
              </div>
            )}

            {/* Saqlash tugmasi */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Saqlanmoqda...' : 'Buyurtma yaratish'}
            </button>
          </form>
        </div>
      )}

      {/* Buyurtmalar ro'yxati */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Hali buyurtmalar yo'q. Birinchi buyurtmani yarating!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">№</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Mijoz</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase hidden md:table-cell">Summa</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Holat</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase hidden lg:table-cell">To'lov</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">Mijoz #{order.client_id}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600 hidden md:table-cell">
                      {order.total_amount.toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        order.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : order.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'approved' ? 'Tasdiqlangan' : 
                         order.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                      {order.payment_type}%
                    </td>
                    {/* YANGI QISM: Boshqaruv tugmalari */}
                    <td className="px-6 py-4 text-sm font-medium">
                      {order.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(order.id, 'approved')}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                          >
                            Tasdiqlash
                          </button>
                          <button
                            onClick={() => handleStatusChange(order.id, 'rejected')}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                          >
                            Rad etish
                          </button>
                        </div>
                      )}
                      {order.status === 'approved' && (
                        <a 
                          href={`https://taunt-pantry-marlin.ngrok-free.dev/orders/${order.id}/pdf`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                        >
                          PDF Yuklash
                        </a>
                      )}
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

export default Orders