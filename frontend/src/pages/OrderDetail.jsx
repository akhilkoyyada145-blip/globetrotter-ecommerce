import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, MapPin, CreditCard } from 'lucide-react';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await orderAPI.getById(id);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading order details...</div>;
  }

  if (!order) {
    return <div className="container mx-auto px-4 py-12">Order not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center text-gray-600 hover:text-accent mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
            <div className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-2" />
              <span>{formatDate(order.orderDate)}</span>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <MapPin size={20} className="mr-2 text-accent" />
              <h3 className="font-bold text-lg">Shipping Address</h3>
            </div>
            <p className="text-gray-700">{order.shippingAddress}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <CreditCard size={20} className="mr-2 text-accent" />
              <h3 className="font-bold text-lg">Payment Method</h3>
            </div>
            <p className="text-gray-700">{order.paymentMethod || 'Cash on Delivery'}</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-4">Order Items</h3>
        <div className="space-y-4 mb-8">
          {order.orderItems?.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
              <img
                src={item.product?.imageUrl || 'https://via.placeholder.com/100'}
                alt={item.product?.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-bold text-lg">{item.product?.name}</h4>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">£{item.price?.toFixed(2)} each</p>
                <p className="font-bold text-lg">£{(item.price * item.quantity)?.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center text-xl">
            <span className="font-bold">Total Amount:</span>
            <span className="font-bold text-accent text-3xl">
              £{order.totalAmount?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;