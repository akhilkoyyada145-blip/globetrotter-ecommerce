import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cartAPI } from '../services/api';

function Navbar({ isAuthenticated, isAdmin, onLogout }) {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    }
  }, [isAuthenticated]);

  const fetchCartCount = async () => {
    try {
      const data = await cartAPI.get();
      const count = data?.cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (error) {
      console.log('Cart fetch error:', error);
      setCartCount(0);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/?search=${searchQuery.trim()}`);
    }
  };

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="bg-accent text-white text-center py-1 text-sm">
        🎉 Free Shipping on Orders Over £50! Limited Time Offer
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold hover:opacity-80 transition">
            <Store size={32} />
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Globetrotter
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full px-4 py-2 pl-10 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative hover:text-accent transition">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
                
                <Link to={isAdmin ? "/admin" : "/dashboard"} className="hover:text-accent transition">
                  <User size={24} />
                </Link>
                
                <button onClick={onLogout} className="hover:text-accent transition">
                  <LogOut size={24} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-6 py-2 rounded-full font-medium hover:bg-orange-600 transition">
                  Login
                </Link>
                <Link to="/register" className="px-6 py-2 rounded-full font-medium hover:bg-orange-600 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full px-4 py-2 pl-10 rounded-full text-gray-800"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;