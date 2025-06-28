import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MessageBox from './components/ui/MessageBox';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProductList from './components/pages/ProductList';
import Cart from './components/pages/Cart';
import Wishlist from './components/pages/Wishlist';
import OrderHistory from './components/pages/OrderHistory';
import AdminDashboard from './components/pages/AdminDashboard';
import ConfirmationModal from './components/modals/ConfirmationModal';
import ProductDetailModal from './components/modals/ProductDetailModal';
import ProfileModal from './components/modals/ProfileModal';
import CheckoutModal from './components/modals/CheckoutModal';
import FeedbackModal from './components/modals/FeedbackModal';

const BASE_API_URL = 'http://localhost:5000';
const USER_STORAGE_KEY = 'shopsmart_user_session';

function App() {
  // --- State ---
  const [page, setPage] = useState('products');
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [wishlist, setWishlist] = useState({ items: [] });
  const [orders, setOrders] = useState([]);
  const [adminData, setAdminData] = useState({ users: [], orders: [], feedback: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [showMessage, setShowMessage] = useState(false);

  // --- Modal State ---
  const [showProfile, setShowProfile] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMsg, setConfirmationMsg] = useState('');
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productInsights, setProductInsights] = useState('');
  const [feedbackProduct, setFeedbackProduct] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');

  // --- Utility Functions ---
  const displayMessage = (msg, type = 'info', duration = 3000) => {
    setMessage(msg);
    setMessageType(type);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), duration);
  };
  const saveUserToStorage = (u) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };
  const clearUserFromStorage = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  // --- API Helpers ---
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (user && user.token) headers['Authorization'] = `Bearer ${user.token}`;
    setLoading(true);
    try {
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401) {
        displayMessage('Session expired. Please log in again.', 'error', 5000);
        clearUserFromStorage();
        throw new Error('Unauthorized');
      }
      if (!res.ok) {
        let err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Request failed (${res.status})`);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // --- Navigation ---
  //const handleNav = (target) => setPage(target);

  // --- Product Fetch ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_API_URL}/api/products`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- Cart/Wishlist Fetch ---
  useEffect(() => {
    if (!user) return;
    const fetchCart = async () => {
      try {
        const res = await makeAuthenticatedRequest(`${BASE_API_URL}/api/cart`);
        setCart(await res.json());
      } catch { setCart({ items: [] }); }
    };
    const fetchWishlist = async () => {
      try {
        const res = await makeAuthenticatedRequest(`${BASE_API_URL}/api/wishlist`);
        setWishlist(await res.json());
      } catch { setWishlist({ items: [] }); }
    };
    if (user) {
      fetchCart();
      fetchWishlist();
    }
  }, [user, makeAuthenticatedRequest]);

  // --- Orders Fetch ---
  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      // Fetch admin data
      const fetchAdmin = async () => {
        try {
          const [usersRes, ordersRes, feedbackRes] = await Promise.all([
            makeAuthenticatedRequest(`${BASE_API_URL}/api/users`),
            makeAuthenticatedRequest(`${BASE_API_URL}/api/orders/admin`), // FIXED: fetch all orders for admin
            makeAuthenticatedRequest(`${BASE_API_URL}/api/feedback`)
          ]);
          setAdminData({
            users: await usersRes.json(),
            orders: await ordersRes.json(),
            feedback: await feedbackRes.json()
          });
        } catch {
          setAdminData({ users: [], orders: [], feedback: [] });
        }
      };
      fetchAdmin();
    } else {
      // Fetch user orders
      const fetchOrders = async () => {
        try {
          const res = await makeAuthenticatedRequest(`${BASE_API_URL}/api/orders/my`);
          setOrders(await res.json());
        } catch { setOrders([]); }
      };
      fetchOrders();
    }
  }, [user, makeAuthenticatedRequest]);

  // --- Auth Handlers ---
  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      saveUserToStorage(data);
      displayMessage('Login successful!', 'success');
      setPage('products');
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async (form) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      saveUserToStorage(data);
      displayMessage('Registration successful!', 'success');
      setPage('products');
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    clearUserFromStorage();
    setPage('login');
    displayMessage('Logged out.', 'info');
  };

  // --- Profile Update ---
  const handleProfileUpdate = async (form) => {
    setLoading(true);
    try {
      const res = await makeAuthenticatedRequest(`${BASE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      saveUserToStorage({ ...user, ...data });
      displayMessage('Profile updated!', 'success');
      setShowProfile(false);
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Product Detail Modal ---
  const openProductDetail = async (productId) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/api/products/${productId}`);
      const prod = await res.json();
      setSelectedProduct(prod);
      setShowProductDetail(true);
      setProductInsights('');
    } catch {
      displayMessage('Failed to load product details.', 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleGenerateInsights = async () => {
    setLoading(true);
    try {
      // Example: call insights endpoint
      const res = await fetch(`${BASE_API_URL}/api/products/${selectedProduct._id}/insights`);
      const data = await res.json();
      setProductInsights(data.insights || 'No insights available.');
    } catch {
      setProductInsights('Failed to generate insights.');
    } finally {
      setLoading(false);
    }
  };

  // --- Cart/Wishlist Actions ---
  const handleAddToCart = async (productId, fromWishlist = false) => {
    if (!user) return displayMessage('Login to add to cart.', 'info');
    setLoading(true);
    try {
      // The backend should handle quantity updates if the item exists.
      // We just need to send the product ID.
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/cart/add`, { // Assuming a dedicated add endpoint
        method: 'POST',
        body: JSON.stringify({ productId })
      });
      displayMessage('Added to cart!', 'success');
      if (fromWishlist) {
        await makeAuthenticatedRequest(`${BASE_API_URL}/api/wishlist/remove`, {
          method: 'POST',
          body: JSON.stringify({ productId })
        });
      }
      // Refresh cart and wishlist
      const [cartRes, wishlistRes] = await Promise.all([
        makeAuthenticatedRequest(`${BASE_API_URL}/api/cart`),
        makeAuthenticatedRequest(`${BASE_API_URL}/api/wishlist`)
      ]);
      setCart(await cartRes.json());
      setWishlist(await wishlistRes.json());
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCartQuantity = async (productId, quantity) => {
    if (!user) return displayMessage('Login to update cart.', 'info');
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/cart/update`, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });
      const cartRes = await makeAuthenticatedRequest(`${BASE_API_URL}/api/cart`);
      setCart(await cartRes.json());
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!user) return displayMessage('Login to modify cart.', 'info');
    askConfirmation('Remove item from cart?', async () => {
      setLoading(true);
      try {
        await makeAuthenticatedRequest(`${BASE_API_URL}/api/cart/remove`, {
          method: 'POST',
          body: JSON.stringify({ productId })
        });
        displayMessage('Removed from cart!', 'success');
        const cartRes = await makeAuthenticatedRequest(`${BASE_API_URL}/api/cart`);
        setCart(await cartRes.json());
      } catch (e) {
        if (e.message && e.message.toLowerCase().includes('not found')) {
          displayMessage('Product not found in cart.', 'error');
        } else {
          displayMessage(e.message, 'error');
        }
      } finally {
        setLoading(false);
      }
    });
  };

  const handleAddToWishlist = async (productId) => {
    if (!user) return displayMessage('Login to add to wishlist.', 'info');
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/wishlist/add`, {
        method: 'POST',
        body: JSON.stringify({ productId })
      });
      displayMessage('Added to wishlist!', 'success');
      const res = await makeAuthenticatedRequest(`${BASE_API_URL}/api/wishlist`);
      setWishlist(await res.json());
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleRemoveFromWishlist = async (productId) => {
    if (!user) return displayMessage('Login to modify wishlist.', 'info');
    askConfirmation('Remove item from wishlist?', async () => {
      setLoading(true);
      try {
        await makeAuthenticatedRequest(`${BASE_API_URL}/api/wishlist/remove`, {
          method: 'POST',
          body: JSON.stringify({ productId })
        });
        displayMessage('Removed from wishlist!', 'success');
        const res = await makeAuthenticatedRequest(`${BASE_API_URL}/api/wishlist`);
        setWishlist(await res.json());
      } catch (e) {
        if (e.message && e.message.toLowerCase().includes('not found')) {
          displayMessage('Product not found in wishlist.', 'error');
        } else {
          displayMessage(e.message, 'error');
        }
      } finally {
        setLoading(false);
      }
    });
  };

  // --- Checkout ---
  const handleCheckout = (paymentMethod) => {
    // This is now called directly from Cart.js with paymentMethod
    handleConfirmOrder(paymentMethod);
  };
  const handleConfirmOrder = async (paymentMethod) => {
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/orders`, {
        method: 'POST',
        body: JSON.stringify({
          paymentMethod,
          cartItems: cart.items.map(item => ({
            productId: item.productId?._id || item.productId || item._id,
            quantity: item.quantity
          }))
        })
      });
      displayMessage('Order placed!', 'success');
      setShowCheckout(false);
      // Refresh cart and orders
      const [cartRes, ordersRes] = await Promise.all([
        makeAuthenticatedRequest(`${BASE_API_URL}/api/cart`),
        makeAuthenticatedRequest(`${BASE_API_URL}/api/orders/my`)
      ]);
      setCart(await cartRes.json());
      setOrders(await ordersRes.json());
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Feedback ---
  const openFeedbackModal = (product) => {
    setFeedbackProduct(product);
    setFeedbackRating(0);
    setFeedbackComment('');
    setShowFeedback(true);
  };
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackProduct) return;
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/feedback`, {
        method: 'POST',
        body: JSON.stringify({
          productId: feedbackProduct._id,
          rating: feedbackRating,
          comment: feedbackComment
        })
      });
      displayMessage('Feedback submitted!', 'success');
      setShowFeedback(false);
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Confirmation Modal ---
  const askConfirmation = (msg, onYes) => {
    setConfirmationMsg(msg);
    setOnConfirm(() => () => {
      setShowConfirmation(false);
      onYes();
    });
    setShowConfirmation(true);
  };

  // --- Admin Product Actions ---
  const handleAdminAddProduct = async (product) => {
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/products`, {
        method: 'POST',
        body: JSON.stringify(product)
      });
      displayMessage('Product added!', 'success');
      // Refresh products
      const res = await fetch(`${BASE_API_URL}/api/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleAdminEditProduct = async (product) => {
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/products/${product._id}`, {
        method: 'PUT',
        body: JSON.stringify(product)
      });
      displayMessage('Product updated!', 'success');
      // Refresh products
      const res = await fetch(`${BASE_API_URL}/api/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleAdminDeleteProduct = async (productId) => {
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/products/${productId}`, {
        method: 'DELETE'
      });
      displayMessage('Product deleted!', 'success');
      // Refresh products
      const res = await fetch(`${BASE_API_URL}/api/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Admin User/Order/Feedback Actions ---
  const handleAdminDeleteUser = async (userId) => {
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/users/${userId}`, { method: 'DELETE' });
      displayMessage('User deleted!', 'success');
      // Refresh admin data
      const [usersRes, ordersRes, feedbackRes] = await Promise.all([
        makeAuthenticatedRequest(`${BASE_API_URL}/api/users`),
        makeAuthenticatedRequest(`${BASE_API_URL}/api/orders/admin`),
        makeAuthenticatedRequest(`${BASE_API_URL}/api/feedback`)
      ]);
      setAdminData({
        users: await usersRes.json(),
        orders: await ordersRes.json(),
        feedback: await feedbackRes.json()
      });
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleAdminDeleteOrder = async (orderId) => {
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/orders/${orderId}`, { method: 'DELETE' });
      displayMessage('Order deleted!', 'success');
      // Refresh admin data
      const [usersRes, ordersRes, feedbackRes] = await Promise.all([
        makeAuthenticatedRequest(`${BASE_API_URL}/api/users`),
        makeAuthenticatedRequest(`${BASE_API_URL}/api/orders/admin`),
        makeAuthenticatedRequest(`${BASE_API_URL}/api/feedback`)
      ]);
      setAdminData({
        users: await usersRes.json(),
        orders: await ordersRes.json(),
        feedback: await feedbackRes.json()
      });
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleAdminDeleteFeedback = async (feedbackId) => {
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/feedback/${feedbackId}`, { method: 'DELETE' });
      displayMessage('Feedback deleted!', 'success');
      // Refresh admin data
      const [usersRes, ordersRes, feedbackRes] = await Promise.all([
        makeAuthenticatedRequest(`${BASE_API_URL}/api/users`),
        makeAuthenticatedRequest(`${BASE_API_URL}/api/orders/admin`),
        makeAuthenticatedRequest(`${BASE_API_URL}/api/feedback`)
      ]);
      setAdminData({
        users: await usersRes.json(),
        orders: await ordersRes.json(),
        feedback: await feedbackRes.json()
      });
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleAdminUpdateOrderStatus = async (orderId, status) => {
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/orders/admin/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      displayMessage('Order status updated!', 'success');
      // Refresh admin data
      const [usersRes, ordersRes, feedbackRes] = await Promise.all([
        makeAuthenticatedRequest(`${BASE_API_URL}/api/users`),
        makeAuthenticatedRequest(`${BASE_API_URL}/api/orders/admin`),
        makeAuthenticatedRequest(`${BASE_API_URL}/api/feedback`)
      ]);
      setAdminData({
        users: await usersRes.json(),
        orders: await ordersRes.json(),
        feedback: await feedbackRes.json()
      });
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleAdminEditUser = async (userId, newRole) => {
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`${BASE_API_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      displayMessage('User role updated!', 'success');
      // Refresh admin data
      const [usersRes, ordersRes, feedbackRes] = await Promise.all([
        makeAuthenticatedRequest(`${BASE_API_URL}/api/users`),
        makeAuthenticatedRequest(`${BASE_API_URL}/api/orders/admin`),
        makeAuthenticatedRequest(`${BASE_API_URL}/api/feedback`)
      ]);
      setAdminData({
        users: await usersRes.json(),
        orders: await ordersRes.json(),
        feedback: await feedbackRes.json()
      });
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <div className="App d-flex flex-column min-vh-100">
      <Header
        user={user}
        cartCount={cart.items.length}
        wishlistCount={wishlist.items.length}
        onNav={setPage}
        onProfile={() => setShowProfile(true)}
        onLogout={handleLogout}
      />
      <MessageBox message={message} type={messageType} show={showMessage} />
      <LoadingSpinner show={loading} />
      <main className="flex-grow-1 py-4">
        <div className="container">
          {page === 'products' && (
            <ProductList
              products={products}
              onProductClick={openProductDetail}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onFeedback={openFeedbackModal}
            />
          )}
          {page === 'cart' && (
            <Cart
              cart={cart}
              onCheckout={handleCheckout}
              onRemove={handleRemoveFromCart}
              onUpdateQuantity={handleUpdateCartQuantity}
            />
          )}
          {page === 'wishlist' && (
            <Wishlist
              wishlist={wishlist}
              onAddToCart={productId => handleAddToCart(productId, true)}
              onRemove={handleRemoveFromWishlist}
            />
          )}
          {page === 'orders' && (
            <OrderHistory orders={orders} />
          )}
          {page === 'admin' && user && user.role === 'admin' && (
            <AdminDashboard
              users={adminData.users}
              orders={adminData.orders}
              feedback={adminData.feedback}
              products={products}
              onAddProduct={handleAdminAddProduct}
              onEditProduct={handleAdminEditProduct}
              onDeleteProduct={handleAdminDeleteProduct}
              onDeleteUser={handleAdminDeleteUser}
              onEditUser={handleAdminEditUser}
              onDeleteOrder={handleAdminDeleteOrder}
              onDeleteFeedback={handleAdminDeleteFeedback}
              onUpdateOrderStatus={handleAdminUpdateOrderStatus}
            />
          )}
          {page === 'login' && (
            <LoginForm onLogin={handleLogin} onSwitch={setPage} />
          )}
          {page === 'register' && (
            <RegisterForm onRegister={handleRegister} onSwitch={setPage} />
          )}
        </div>
      </main>
      <Footer />
      <ProfileModal
        show={showProfile}
        user={user}
        onClose={() => setShowProfile(false)}
        onUpdate={handleProfileUpdate}
        onLogout={handleLogout}
      />
      <CheckoutModal
        show={showCheckout}
        total={cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}
        address={user?.address || ''}
        onClose={() => setShowCheckout(false)}
        onConfirm={handleConfirmOrder}
      />
      <FeedbackModal
        show={showFeedback}
        productName={feedbackProduct?.name || ''}
        rating={feedbackRating}
        comment={feedbackComment}
        onRatingChange={setFeedbackRating}
        onCommentChange={setFeedbackComment}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedbackSubmit}
      />
      <ConfirmationModal
        show={showConfirmation}
        message={confirmationMsg}
        onConfirm={onConfirm}
        onCancel={() => setShowConfirmation(false)}
      />
      <ProductDetailModal
        show={showProductDetail}
        product={selectedProduct}
        onClose={() => setShowProductDetail(false)}
        onAddToCart={() => handleAddToCart(selectedProduct._id)}
        onGenerateInsights={handleGenerateInsights}
        insights={productInsights}
      />
    </div>
  );
}

// Dummy Login/Register forms for demonstration (replace with real forms/components)
function LoginForm({ onLogin, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <form className="mx-auto" style={{ maxWidth: 400 }} onSubmit={e => { e.preventDefault(); onLogin(email, password); }}>
      <h2 className="fs-2 fw-bold text-dark text-center mb-4">Login</h2>
      <div className="mb-3">
        <label className="form-label">Email:</label>
        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Password:</label>
        <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm">Login</button>
      <p className="text-center mt-3 text-secondary">Don't have an account? <span className="text-primary text-decoration-none" style={{ cursor: 'pointer' }} onClick={() => onSwitch('register')}>Register here</span></p>
    </form>
  );
}
function RegisterForm({ onRegister, onSwitch }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', phone: '' });
  return (
    <form className="mx-auto" style={{ maxWidth: 400 }} onSubmit={e => { e.preventDefault(); onRegister(form); }}>
      <h2 className="fs-2 fw-bold text-dark text-center mb-4">Register</h2>
      <div className="mb-3">
        <label className="form-label">Full Name:</label>
        <input type="text" className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Email:</label>
        <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Password:</label>
        <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Address:</label>
        <input type="text" className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
      </div>
      <div className="mb-3">
        <label className="form-label">Phone Number:</label>
        <input type="tel" className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
      </div>
      <button type="submit" className="btn btn-success btn-lg w-100 shadow-sm">Register</button>
      <p className="text-center mt-3 text-secondary">Already have an account? <span className="text-primary text-decoration-none" style={{ cursor: 'pointer' }} onClick={() => onSwitch('login')}>Login here</span></p>
    </form>
  );
}

export default App;

// --- Feedback Stars: Ensure FontAwesome is loaded in index.html or public/index.html ---
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
