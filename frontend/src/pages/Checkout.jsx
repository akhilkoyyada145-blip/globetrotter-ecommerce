import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Check } from 'lucide-react';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

function Checkout() {
  const [orderData, setOrderData] = useState({
    shippingAddress: '',
    paymentMethod: 'Credit Card'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orderAPI.create(orderData);
      toast.success('Order placed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="text-accent" />
              <h2 className="text-2xl font-bold">Shipping Address</h2>
            </div>
            <textarea
              value={orderData.shippingAddress}
              onChange={(e) => setOrderData({ ...orderData, shippingAddress: e.target.value })}
              placeholder="Enter your full shipping address..."
              rows="4"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent text-base"
              required
            />
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="text-accent" />
              <h2 className="text-2xl font-bold">Payment Method</h2>
            </div>
            <select
              value={orderData.paymentMethod}
              onChange={(e) => setOrderData({ ...orderData, paymentMethod: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent text-base"
            >
              <option>Credit Card</option>
              <option>Debit Card</option>
              <option>PayPal</option>
              <option>Cash on Delivery</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-orange-600 text-white py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Check size={24} />
            <span>{loading ? 'Placing Order...' : 'Place Order'}</span>
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit sticky top-24">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Calculated at next step</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-accent">To be calculated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;