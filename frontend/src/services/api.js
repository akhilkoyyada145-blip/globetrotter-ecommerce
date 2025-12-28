import axios from 'axios';

const API_BASE_URL = 'https://imvtlqyyjj.execute-api.eu-north-1.amazonaws.com/prod/api';
// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData).then(res => res.data),
  login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
};

// Product API
export const productAPI = {
  getAll: () => api.get('/products').then(res => res.data),
  getById: (id) => api.get(`/products/${id}`).then(res => res.data),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`).then(res => res.data),
  search: (keyword) => api.get(`/products/search?keyword=${keyword}`).then(res => res.data),
  create: (productData) => api.post('/products', productData).then(res => res.data),
  update: (id, productData) => api.put(`/products/${id}`, productData).then(res => res.data),
  delete: (id) => api.delete(`/products/${id}`).then(res => res.data),
  addToCart: (productId, quantity) => 
    api.post('/cart/add', { productId, quantity }).then(res => res.data),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories').then(res => res.data),
  getById: (id) => api.get(`/categories/${id}`).then(res => res.data),
  create: (categoryData) => api.post('/categories', categoryData).then(res => res.data),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData).then(res => res.data),
  delete: (id) => api.delete(`/categories/${id}`).then(res => res.data),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart').then(res => res.data),
  add: (productId, quantity) => 
    api.post('/cart/add', { productId, quantity }).then(res => res.data),
  update: (productId, quantity) => 
    api.put('/cart/update', { productId, quantity }).then(res => res.data),
  remove: (productId) => api.delete(`/cart/remove/${productId}`).then(res => res.data),
  clear: () => api.delete('/cart/clear').then(res => res.data),
  getTotal: () => api.get('/cart/total').then(res => res.data),
};

// Order API
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData).then(res => res.data),
  getAll: () => api.get('/orders').then(res => res.data),
  getById: (id) => api.get(`/orders/${id}`).then(res => res.data),
  getAllOrdersAdmin: () => api.get('/admin/orders').then(res => res.data),
  updateOrderStatus: (orderId, status) => api.put(`/admin/orders/${orderId}/status?status=${status}`).then(res => res.data),
  clearAllOrders: () => api.delete('/admin/orders/clear').then(res => res.data),  // ← ADD THIS LINE
};

// Review API
export const reviewAPI = {
  create: (reviewData) => api.post('/reviews', reviewData).then(res => res.data),
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`).then(res => res.data),
  getUserReviews: () => api.get('/reviews/user').then(res => res.data),
  delete: (id) => api.delete(`/reviews/${id}`).then(res => res.data),
};

export default api;