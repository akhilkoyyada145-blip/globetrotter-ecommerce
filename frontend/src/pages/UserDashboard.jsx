import { useState, useEffect } from 'react';
import { Package, User as UserIcon, Clock } from 'lucide-react';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function UserDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderAPI.getAll();
      console.log('Orders response:', data);
      console.log('Is array?', Array.isArray(data));
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Orders error:', error);
      setOrders([]);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-gradient-to-r from-primary to-blue-900 text-white rounded-2xl p-8 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-4 rounded-full">
            <UserIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {username}!</h1>
            <p className="text-blue-100">Manage your orders and account</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
      
      {loading ? (
        <div>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
          <Link to="/" className="inline-block bg-accent hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Order #{order.id}</h3>
                  <div className="flex items-center space-x-2 text-gray-600 text-sm">
                    <Clock size={16} />
                    <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">{order.orderItems?.length || 0} items</p>
                    <p className="font-bold text-xl text-accent">£{order.totalAmount?.toFixed(2)}</p>
                  </div>
                  <Link 
                    to={`/orders/${order.id}`}
                    className="text-accent hover:underline font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;