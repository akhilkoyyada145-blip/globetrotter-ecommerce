import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import AdminOrders from './pages/AdminOrders';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      setIsAuthenticated(true);
      if (role === 'ADMIN') {
        setIsAdmin(true);
      }
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    if (role === 'ADMIN') {
      setIsAdmin(true);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isAuthenticated={isAuthenticated} isAdmin={isAdmin} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={isAuthenticated ? <Cart /> : <Navigate to="/login" />} />
            <Route path="/checkout" element={isAuthenticated ? <Checkout /> : <Navigate to="/login" />} />
            <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login" />} />
            <Route path="/orders/:id" element={isAuthenticated ? <OrderDetail /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={isAuthenticated ? <UserDashboard /> : <Navigate to="/login" />} />
            <Route path="/admin" element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/admin/orders" element={isAuthenticated && isAdmin ? <AdminOrders /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;