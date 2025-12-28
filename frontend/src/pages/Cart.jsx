import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';
import { cartAPI, productAPI } from '../services/api';
import toast from 'react-hot-toast';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    fetchRecommendedProducts();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await cartAPI.get();
      setCart(data);
    } catch (error) {
      console.error('Cart error:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      const data = await productAPI.getAll();
      const shuffled = data.sort(() => 0.5 - Math.random());
      setRecommendedProducts(shuffled.slice(0, 8));
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cartAPI.update(productId, newQuantity);
      fetchCart();
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const removeItem = async (productId) => {
    try {
      await cartAPI.remove(productId);
      fetchCart();
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const addToCart = async (productId) => {
    try {
      await cartAPI.add(productId, 1);
      fetchCart();
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const total = cart?.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  if (loading) return <div className="container mx-auto px-4 py-12">Loading cart...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      {!cart || cart.cartItems?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Start shopping to add items!</p>
          <Link to="/" className="inline-block bg-accent hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold transition">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.cartItems.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-6">
                  <img
                    src={item.product.imageUrl || 'https://via.placeholder.com/150'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.product.name}</h3>
                    <p className="text-accent font-bold text-xl">£{item.price?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-x">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold">£{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-accent">£{total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-accent hover:bg-orange-600 text-white py-3 rounded-lg font-bold transition transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={20} />
                </button>
                <Link to="/" className="block text-center mt-4 text-accent hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          {/* RECOMMENDED PRODUCTS SECTION */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="cursor-pointer"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="p-4">
                    <h3
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="font-semibold text-lg mb-2 truncate hover:text-accent cursor-pointer"
                    >
                      {product.name}
                    </h3>

                    <p className="text-2xl font-bold text-accent mb-4">
                      £{product.price?.toFixed(2)}
                    </p>

                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stockQuantity === 0}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition ${
                        product.stockQuantity === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-accent hover:bg-orange-600 text-white'
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;