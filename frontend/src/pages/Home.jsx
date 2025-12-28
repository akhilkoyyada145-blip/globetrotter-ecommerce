import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { ShoppingCart, Star, Package, X, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, minPrice, maxPrice, sortBy, allProducts, searchParams]);

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productAPI.getAll();
      setAllProducts(Array.isArray(data) ? data : []);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setAllProducts([]);
      setProducts([]);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    const urlSearch = searchParams.get('search');
    
    if (urlSearch) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(urlSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(urlSearch.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category?.id === selectedCategory);
    }

    if (minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
    }

    switch(sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setProducts(filtered);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
    navigate('/');
  };

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await productAPI.addToCart(productId, 1);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < fullStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const activeFiltersCount = [selectedCategory, minPrice, maxPrice, searchParams.get('search')].filter(Boolean).length;
  const urlSearch = searchParams.get('search');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Globetrotter</h1>
          <p className="text-xl mb-8">Discover Amazing Products at Unbeatable Prices</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
              className="bg-accent hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Get your orders delivered within 24-48 hours</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
            <p className="text-gray-600">100% authentic products with warranty</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Price</h3>
            <p className="text-gray-600">Competitive prices with regular discounts</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              !selectedCategory
                ? 'bg-accent text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                selectedCategory === category.id
                  ? 'bg-accent text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {urlSearch && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-gray-700">
              Search results for: <span className="font-bold">"{urlSearch}"</span>
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <X size={16} />
              Clear Search
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <SlidersHorizontal size={24} />
              Filters & Sort
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-red-500 hover:text-red-700 flex items-center gap-2 text-sm font-semibold"
              >
                <X size={16} />
                Clear All ({activeFiltersCount})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="number"
                placeholder="Min Price (£)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="number"
                placeholder="Max Price (£)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {products.length} of {allProducts.length} products
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-300 h-6 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded mb-4"></div>
                <div className="bg-gray-300 h-10 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-4">No products found</p>
            <button
              onClick={clearFilters}
              className="bg-accent hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group cursor-pointer"
              >
                <div
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="relative overflow-hidden"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition duration-300"
                  />
                  {product.stockQuantity < 10 && product.stockQuantity > 0 && (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Low Stock
                    </span>
                  )}
                  {product.stockQuantity === 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="font-semibold text-lg mb-2 truncate hover:text-accent"
                  >
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(product.rating)}
                    <span className="text-sm text-gray-600 ml-1">
                      ({product.reviewsCount || 0})
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-accent mb-4">
                    £{product.price?.toFixed(2)}
                  </p>

                  <button
                    onClick={() => handleAddToCart(product.id)}
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
        )}
      </div>
    </div>
  );
};

export default Home;