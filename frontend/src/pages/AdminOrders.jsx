import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Package, User, MapPin, Calendar, DollarSign } from 'lucide-react';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOrders();
    // Auto-refresh every 5 seconds for near real-time updates
    const interval = setInterval(fetchAllOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await orderAPI.getAllOrdersAdmin();
      setOrders(response || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated!');
      fetchAllOrders(); // Refresh the list
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleClearOrders = async () => {
    if (window.confirm('Are you sure you want to delete ALL orders? This action cannot be undone!')) {
      try {
        await orderAPI.clearAllOrders();
        toast.success('All orders cleared successfully!');
        fetchAllOrders(); // Refresh the list
      } catch (error) {
        console.error('Failed to clear orders:', error);
        toast.error('Failed to clear orders');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading orders...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Customer Orders</h1>
        <div className="flex gap-4">
          <button 
            onClick={handleClearOrders}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
          >
            Clear All Orders
          </button>
          <button 
            onClick={fetchAllOrders}
            className="bg-accent hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-xl">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-accent">Order #{order.id}</h2>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={16} />
                      <span className="font-bold">£{order.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Dropdown */}
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className={`px-4 py-2 rounded-lg font-bold ${getStatusColor(order.status)}`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <User size={20} className="text-accent mt-1" />
                  <div>
                    <p className="font-bold">Customer</p>
                    <p className="text-gray-600">{order.user?.username || 'N/A'}</p>
                    <p className="text-gray-600 text-sm">{order.user?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={20} className="text-accent mt-1" />
                  <div>
                    <p className="font-bold">Delivery Address</p>
                    <p className="text-gray-600">{order.shippingAddress || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="font-bold mb-2">Items:</p>
                <div className="space-y-2">
                  {order.orderItems?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.product?.imageUrl || 'https://via.placeholder.com/50'} 
                          alt={item.product?.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-accent">£{item.price?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;