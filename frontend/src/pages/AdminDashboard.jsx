import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, ShoppingBag, DollarSign } from 'lucide-react';
import { productAPI, categoryAPI, orderAPI } from '../services/api';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    imageUrl: ''
  });
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProduct, setEditProduct] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll()
      ]);
      
      setProducts(productsRes || []);
      setCategories(categoriesRes || []);
      
      try {
        const ordersRes = await orderAPI.getAllOrdersAdmin();
        setOrders(ordersRes || []);
      } catch (error) {
        console.log('Orders not available yet');
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    console.log("=== DEBUG ===");
    console.log("newProduct:", newProduct);
    console.log("categoryId:", newProduct.categoryId);
    console.log("categoryId type:", typeof newProduct.categoryId);
    
    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        stockQuantity: parseInt(newProduct.stockQuantity),
        categoryId: parseInt(newProduct.categoryId),
        imageUrl: newProduct.imageUrl
      };
      
      console.log("Sending:", productData);
      console.log("=== END DEBUG ===");
      
      await productAPI.create(productData);
      toast.success('Product added successfully!');
      setShowAddProduct(false);
      setNewProduct({ name: '', description: '', price: '', stockQuantity: '', categoryId: '', imageUrl: '' });
      fetchData();
    } catch (error) {
      console.error('Add product error:', error);
      toast.error('Failed to add product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        toast.success('Product deleted');
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product.id);
    setEditProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.category?.id || '',
      imageUrl: product.imageUrl
    });
    setShowAddProduct(false);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name: editProduct.name,
        description: editProduct.description,
        price: parseFloat(editProduct.price),
        stockQuantity: parseInt(editProduct.stockQuantity),
        categoryId: parseInt(editProduct.categoryId),
        imageUrl: editProduct.imageUrl
      };
      await productAPI.update(editProduct.id, productData);
      toast.success('Product updated successfully!');
      setEditingProduct(null);
      setEditProduct({ id: '', name: '', description: '', price: '', stockQuantity: '', categoryId: '', imageUrl: '' });
      fetchData();
    } catch (error) {
      console.error('Update product error:', error);
      toast.error('Failed to update product');
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditProduct({ id: '', name: '', description: '', price: '', stockQuantity: '', categoryId: '', imageUrl: '' });
  };

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    lowStock: products.filter(p => p.stockQuantity < 10).length
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-3xl font-bold">{stats.totalProducts}</p>
            </div>
            <Package className="text-blue-500" size={40} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
            </div>
            <ShoppingBag className="text-green-500" size={40} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Revenue</p>
              <p className="text-3xl font-bold">£{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="text-purple-500" size={40} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Stock</p>
              <p className="text-3xl font-bold text-red-500">{stats.lowStock}</p>
            </div>
            <Package className="text-red-500" size={40} />
          </div>
        </div>
      </div>

      {/* View All Customer Orders Button */}
      <div className="mb-6">
        <Link 
          to="/admin/orders"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold inline-flex items-center space-x-2 transition transform hover:scale-105"
        >
          <ShoppingBag size={20} />
          <span>View All Customer Orders</span>
        </Link>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowAddProduct(!showAddProduct)}
          className="bg-accent hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold flex items-center space-x-2 transition transform hover:scale-105"
        >
          <Plus size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      {showAddProduct && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
            <select
              value={newProduct.categoryId}
              onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
              className="px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={newProduct.stockQuantity}
              onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
              className="px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
            <input
              type="url"
              placeholder="Image URL"
              value={newProduct.imageUrl}
              onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
              className="px-4 py-3 border rounded-lg text-base md:col-span-2 focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <textarea
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="px-4 py-3 border rounded-lg text-base md:col-span-2 focus:ring-2 focus:ring-accent focus:border-transparent"
              rows="3"
            />
            <button
              type="submit"
              className="md:col-span-2 bg-accent hover:bg-orange-600 text-white py-3 rounded-lg font-bold text-lg transition transform hover:scale-105"
            >
              Add Product
            </button>
          </form>
        </div>
      )}

      {editingProduct && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-2 border-blue-500">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">Edit Product</h2>
          <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={editProduct.name}
              onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              className="px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <select
              value={editProduct.categoryId}
              onChange={(e) => setEditProduct({ ...editProduct, categoryId: e.target.value })}
              className="px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={editProduct.price}
              onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
              className="px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={editProduct.stockQuantity}
              onChange={(e) => setEditProduct({ ...editProduct, stockQuantity: e.target.value })}
              className="px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="url"
              placeholder="Image URL"
              value={editProduct.imageUrl}
              onChange={(e) => setEditProduct({ ...editProduct, imageUrl: e.target.value })}
              className="px-4 py-3 border rounded-lg text-base md:col-span-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Description"
              value={editProduct.description}
              onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
              className="px-4 py-3 border rounded-lg text-base md:col-span-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg transition"
              >
                Update Product
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold text-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Manage Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Product</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Price</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.imageUrl || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category?.name}</td>
                  <td className="px-6 py-4 font-bold text-accent">£{product.price?.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={product.stockQuantity < 10 ? 'text-red-600 font-bold' : 'text-gray-600'}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Edit Product"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;