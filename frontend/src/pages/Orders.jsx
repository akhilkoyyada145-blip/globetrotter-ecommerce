import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderAPI.getAll();
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading orders...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to create your first order!</p>
          <button
            onClick={() => navigate('/')}
            className="bg-accent hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold transition"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Order #{order.id}</h3>
                  <div className="flex items-center text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>{formatDate(order.orderDate)}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-accent">£{order.totalAmount?.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin size={16} className="mr-2" />
                <span className="text-sm">{order.shippingAddress}</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600">
                  {order.orderItems?.length || 0} item(s)
                </span>
                <button className="flex items-center text-accent font-semibold hover:underline">
                  View Details
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;