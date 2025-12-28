import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Package, Truck, ArrowLeft } from 'lucide-react';
import { productAPI, cartAPI, reviewAPI } from '../services/api';
import toast from 'react-hot-toast';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await productAPI.getById(id);
      setProduct(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Product not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await reviewAPI.getByProduct(id);
      setReviews(data || []);
    } catch (error) {
      setReviews([]);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    try {
      await cartAPI.add(product.id, quantity);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-12">Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 text-gray-600 hover:text-accent mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Products</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full rounded-2xl shadow-lg"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={star <= (product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  size={20}
                />
              ))}
            </div>
            <span className="text-gray-600">({product.reviewsCount || 0} reviews)</span>
          </div>

          <div className="text-4xl font-bold text-accent mb-6">
            £{product.price.toFixed(2)}
          </div>

          <p className="text-gray-700 mb-6 text-lg">{product.description}</p>

          <div className="flex items-center space-x-2 mb-6">
            <Package size={20} className="text-green-600" />
            <span className="text-green-600 font-medium">
              {product.stockQuantity} in stock
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Truck size={20} className="text-blue-600" />
              <span className="font-medium">Free delivery on orders over £50</span>
            </div>
          </div>

          {product.stockQuantity > 0 && (
            <>
              <div className="flex items-center space-x-4 mb-6">
                <label className="font-medium text-lg">Quantity:</label>
                <div className="flex items-center border-2 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 text-xl"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x-2 text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-100 text-xl"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-accent hover:bg-orange-600 text-white py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={24} />
                <span>Add to Cart</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      size={16}
                    />
                  ))}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No reviews yet</p>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;