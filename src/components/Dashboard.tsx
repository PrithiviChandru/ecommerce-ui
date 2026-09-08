import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  LogOut, 
  Tag, 
  Check, 
  ShoppingBag, 
  X, 
  Users, 
  LayoutDashboard, 
  Menu, 
  User, 
  CreditCard, 
  Package, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';
import { Profile } from './Profile';
import { UsersList } from './UsersList';
import { CatalogManagement } from './CatalogManagement';
import { api } from '../services/api';

interface Product{
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName:string;
  price: number;
  stock: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardProps {
  userEmail: string;
  token: string;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userEmail, token, onLogout }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<{ [productId: number]: number }>({});
  const [showCartToast, setShowCartToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentTab, setCurrentTab] = useState<'products' | 'profile' | 'users' | 'catalog' | 'overview' | 'orders' | 'payments'>('products');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  // Cart & Order states
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Payment states
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  // Admin stats states
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await api.getProfile(token);
        if (response.apiStatus) {
          const role = response.data.role;
          setUserRole(role);
          if (role === 'ADMIN') {
            setCurrentTab('overview');
          }
        }
      } catch (err) {
        console.error('Failed to fetch user role for admin access:', err);
      }
    };
    if (token) {
      fetchUserRole();
    }
  }, [token]);

  const fetchAdminStats = async () => {
    try {
      setStatsLoading(true);
      const [prodResponse, catResponse, usersResponse] = await Promise.all([
        api.getProducts(token, 0, 1),
        api.getCategories(token, 0, 1),
        api.getUsers(token)
      ]);
      setTotalProducts(prodResponse?.data?.totalElements || 0);
      setTotalCategories(catResponse?.data?.totalElements || 0);
      setTotalUsers(usersResponse?.data?.length || 0);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (token && userRole === 'ADMIN') {
      fetchAdminStats();
    }
  }, [token, userRole]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodResponse, catResponse] = await Promise.all([
          api.getProducts(token, 0, 50, 'id', 'asc'),
          api.getCategories(token, 0, 5, 'id', 'asc')
        ]);
        
        const fetchedProducts = prodResponse?.data?.content || [];
        const fetchedCategories = catResponse?.data?.content || [];
        
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const categoryNames = useMemo(() => {
    return ['All', ...categories.map((c) => c.name)];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.categoryName === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (product.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => ({
      ...prevCart,
      [product.id]: (prevCart[product.id] || 0) + 1
    }));
    setToastMessage(`Added "${product.name}" to cart!`);
    setShowCartToast(true);
    setTimeout(() => {
      setShowCartToast(false);
    }, 2500);
  };

  const handleNavClick = (tab: 'products' | 'profile' | 'users' | 'catalog' | 'overview' | 'orders' | 'payments') => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (currentTab === 'orders' && token) {
        try {
          setOrdersLoading(true);
          setOrdersError(null);
          const response = userRole === 'ADMIN' ? await api.getAllOrders(token) : await api.getOrders(token);
          if (response && response.apiStatus && Array.isArray(response.data)) {
            setOrders(response.data);
          } else if (Array.isArray(response)) {
            setOrders(response);
          } else if (response && Array.isArray(response.data)) {
            setOrders(response.data);
          } else {
            setOrders([]);
          }
        } catch (err: any) {
          console.error('Failed to fetch orders:', err);
          setOrdersError(err.message || 'Failed to fetch orders');
        } finally {
          setOrdersLoading(false);
        }
      }
    };
    fetchOrders();
  }, [currentTab, token, userRole]);

  useEffect(() => {
    const fetchPayments = async () => {
      if (currentTab === 'payments' && token) {
        try {
          setPaymentsLoading(true);
          setPaymentsError(null);
          const response = await api.getMyPayments(token);
          if (response && response.apiStatus && Array.isArray(response.data)) {
            setPayments(response.data);
          } else if (Array.isArray(response)) {
            setPayments(response);
          } else if (response && Array.isArray(response.data)) {
            setPayments(response.data);
          } else {
            setPayments([]);
          }
        } catch (err: any) {
          console.error('Failed to fetch payments:', err);
          setPaymentsError(err.message || 'Failed to fetch payments');
        } finally {
          setPaymentsLoading(false);
        }
      }
    };
    fetchPayments();
  }, [currentTab, token]);

  const handleCheckout = async () => {
    if (Object.keys(cart).length === 0) return;
    try {
      setPlacingOrder(true);
      const cartItems = Object.entries(cart).map(([productId, quantity]) => ({
        productId: Number(productId),
        quantity
      }));

      // Place each order sequentially
      for (const item of cartItems) {
        await api.createOrder(token, item);
      }

      setCart({});
      setShowCartDrawer(false);
      setToastMessage('Order placed successfully!');
      setShowCartToast(true);
      setTimeout(() => setShowCartToast(false), 3000);
      setCurrentTab('orders');
    } catch (err: any) {
      console.error('Failed to place order:', err);
      alert(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.cancelOrder(token, orderId);
      // Refresh the orders list
      const response = userRole === 'ADMIN' ? await api.getAllOrders(token) : await api.getOrders(token);
      if (response && response.apiStatus && Array.isArray(response.data)) {
        setOrders(response.data);
      } else if (Array.isArray(response)) {
        setOrders(response);
      } else if (response && Array.isArray(response.data)) {
        setOrders(response.data);
      }
      setToastMessage('Order cancelled successfully.');
      setShowCartToast(true);
      setTimeout(() => setShowCartToast(false), 3000);
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      alert(err.message || 'Failed to cancel order.');
    }
  };

  const handlePayOrder = async (orderId: number, paymentMethod: string) => {
    try {
      const response = await api.makePayment(token, { orderId, paymentMethod });
      if (response && response.apiStatus && response.data) {
        setToastMessage(`Payment of ₹${response.data.amount} processed! Status: ${response.data.paymentStatus}`);
      } else {
        setToastMessage('Payment completed successfully!');
      }
      setShowCartToast(true);
      setTimeout(() => setShowCartToast(false), 3000);

      // Refresh orders
      const orderResponse = userRole === 'ADMIN' ? await api.getAllOrders(token) : await api.getOrders(token);
      if (orderResponse && orderResponse.apiStatus && Array.isArray(orderResponse.data)) {
        setOrders(orderResponse.data);
      } else if (Array.isArray(orderResponse)) {
        setOrders(orderResponse);
      } else if (orderResponse && Array.isArray(orderResponse.data)) {
        setOrders(orderResponse.data);
      }
    } catch (err: any) {
      console.error('Failed to make payment:', err);
      alert(err.message || 'Payment failed.');
    }
  };

  const totalCartItems = Object.values(cart).reduce((sum, count) => sum + count, 0);

  return (
    <div className="dashboard-wrapper">
      {/* Toast Alert */}
      {showCartToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          background: 'rgba(16, 185, 129, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <Check size={20} style={{ background: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%', padding: '2px' }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>Item Added</p>
            <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Responsive Navigation Bar */}
      <nav className="navbar-container">
        {/* Main Header Row */}
        <div className="navbar-main-row">
          {/* Logo Section */}
          <button 
            onClick={() => handleNavClick(userRole === 'ADMIN' ? 'overview' : 'products')}
            className="navbar-logo-btn"
          >
            <div className="navbar-logo-icon">
              <ShoppingBag style={{ color: 'white', width: '20px', height: '20px' }} />
            </div>
            <span className="navbar-logo-text">
              ShopSphere
            </span>
          </button>

          {/* Desktop Search Input Container */}
          <div className="navbar-desktop-search">
            <Search style={{
              position: 'absolute',
              left: '16px',
              color: '#64748b',
              pointerEvents: 'none'
            }} size={18} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '30px',
                padding: '12px 42px 12px 48px',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                transition: 'var(--transition-smooth)'
              }}
              className="form-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Desktop Right Nav Utilities */}
          <div className="navbar-desktop-nav">
            {/* User profile identifier */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '4px', maxWidth: '140px' }}>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Signed in</span>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#4338ca', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                {userEmail}
              </span>
            </div>

            {/* Shop Navigation Button */}
            {userRole !== 'ADMIN' && currentTab !== 'products' && (
              <button
                onClick={() => handleNavClick('products')}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '7px 14px',
                  color: '#1e293b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#1e293b';
                }}
              >
                Shop
              </button>
            )}

            {/* My Orders Button */}
            {userRole !== 'ADMIN' && (
              <button
                onClick={() => handleNavClick('orders')}
                style={{
                  background: currentTab === 'orders' ? 'var(--primary-600)' : '#ffffff',
                  border: currentTab === 'orders' ? '1.5px solid var(--primary-600)' : '1.5px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '7px 14px',
                  color: currentTab === 'orders' ? '#ffffff' : '#1e293b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: currentTab === 'orders' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  if (currentTab !== 'orders') {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.color = '#0f172a';
                  } else {
                    e.currentTarget.style.background = 'var(--primary-700)';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentTab !== 'orders') {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.color = '#1e293b';
                  } else {
                    e.currentTarget.style.background = 'var(--primary-600)';
                  }
                }}
              >
                My Orders
              </button>
            )}

            {/* My Payments Button */}
            {userRole !== 'ADMIN' && (
              <button
                onClick={() => handleNavClick('payments')}
                style={{
                  background: currentTab === 'payments' ? 'var(--primary-600)' : '#ffffff',
                  border: currentTab === 'payments' ? '1.5px solid var(--primary-600)' : '1.5px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '7px 14px',
                  color: currentTab === 'payments' ? '#ffffff' : '#1e293b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: currentTab === 'payments' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  if (currentTab !== 'payments') {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.color = '#0f172a';
                  } else {
                    e.currentTarget.style.background = 'var(--primary-700)';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentTab !== 'payments') {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.color = '#1e293b';
                  } else {
                    e.currentTarget.style.background = 'var(--primary-600)';
                  }
                }}
              >
                My Payments
              </button>
            )}

            {/* Overview Navigation Button (Admin Only) */}
            {userRole === 'ADMIN' && (
              <button
                onClick={() => handleNavClick('overview')}
                style={{
                  background: currentTab === 'overview' ? 'var(--primary-600)' : '#ffffff',
                  border: currentTab === 'overview' ? '1.5px solid var(--primary-600)' : '1.5px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '7px 14px',
                  color: currentTab === 'overview' ? '#ffffff' : '#1e293b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: currentTab === 'overview' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  if (currentTab !== 'overview') {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.color = '#0f172a';
                  } else {
                    e.currentTarget.style.background = 'var(--primary-700)';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentTab !== 'overview') {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.color = '#1e293b';
                  } else {
                    e.currentTarget.style.background = 'var(--primary-600)';
                  }
                }}
              >
                <LayoutDashboard size={14} />
                <span>Overview</span>
              </button>
            )}

            {/* Catalog Management Button (Admin Only) */}
            {userRole === 'ADMIN' && (
              <button
                onClick={() => handleNavClick('catalog')}
                style={{
                  background: currentTab === 'catalog' ? 'var(--primary-600)' : '#ffffff',
                  border: currentTab === 'catalog' ? '1.5px solid var(--primary-600)' : '1.5px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '7px 14px',
                  color: currentTab === 'catalog' ? '#ffffff' : '#1e293b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: currentTab === 'catalog' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  if (currentTab !== 'catalog') {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.color = '#0f172a';
                  } else {
                    e.currentTarget.style.background = 'var(--primary-700)';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentTab !== 'catalog') {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.color = '#1e293b';
                  } else {
                    e.currentTarget.style.background = 'var(--primary-600)';
                  }
                }}
              >
                <ShoppingBag size={14} />
                <span>Catalog</span>
              </button>
            )}

            {/* Users Navigation Button (Admin Only) */}
            {userRole === 'ADMIN' && (
              <button
                onClick={() => handleNavClick('users')}
                style={{
                  background: currentTab === 'users' ? 'var(--primary-600)' : '#ffffff',
                  border: currentTab === 'users' ? '1.5px solid var(--primary-600)' : '1.5px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '7px 14px',
                  color: currentTab === 'users' ? '#ffffff' : '#1e293b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: currentTab === 'users' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  if (currentTab !== 'users') {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.color = '#0f172a';
                  } else {
                    e.currentTarget.style.background = 'var(--primary-700)';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentTab !== 'users') {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.color = '#1e293b';
                  } else {
                    e.currentTarget.style.background = 'var(--primary-600)';
                  }
                }}
              >
                <Users size={14} />
                <span>Users</span>
              </button>
            )}

            {/* Orders Navigation Button (Admin Only) */}
            {userRole === 'ADMIN' && (
              <button
                onClick={() => handleNavClick('orders')}
                style={{
                  background: currentTab === 'orders' ? 'var(--primary-600)' : '#ffffff',
                  border: currentTab === 'orders' ? '1.5px solid var(--primary-600)' : '1.5px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '7px 14px',
                  color: currentTab === 'orders' ? '#ffffff' : '#1e293b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: currentTab === 'orders' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  if (currentTab !== 'orders') {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.color = '#0f172a';
                  } else {
                    e.currentTarget.style.background = 'var(--primary-700)';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentTab !== 'orders') {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.color = '#1e293b';
                  } else {
                    e.currentTarget.style.background = 'var(--primary-600)';
                  }
                }}
              >
                <Package size={14} />
                <span>Orders</span>
              </button>
            )}

            {/* Profile Navigation Button */}
            <button
              onClick={() => handleNavClick('profile')}
              style={{
                background: currentTab === 'profile' ? 'var(--primary-600)' : '#ffffff',
                border: currentTab === 'profile' ? '1.5px solid var(--primary-600)' : '1.5px solid #cbd5e1',
                borderRadius: '20px',
                padding: '7px 14px',
                color: currentTab === 'profile' ? '#ffffff' : '#1e293b',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: currentTab === 'profile' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'var(--transition-fast)'
              }}
              onMouseOver={(e) => {
                if (currentTab !== 'profile') {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.color = '#0f172a';
                } else {
                  e.currentTarget.style.background = 'var(--primary-700)';
                }
              }}
              onMouseOut={(e) => {
                if (currentTab !== 'profile') {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#1e293b';
                } else {
                  e.currentTarget.style.background = 'var(--primary-600)';
                }
              }}
            >
              Profile
            </button>

            {/* Cart Icon */}
            {userRole !== 'ADMIN' && (
              <div 
                onClick={() => setShowCartDrawer(true)}
                style={{ position: 'relative', cursor: 'pointer', padding: '6px' }}
                title="Shopping Cart"
              >
                <ShoppingCart size={22} style={{ color: '#0f172a' }} />
                {totalCartItems > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: 'var(--primary-600)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.4)',
                    animation: 'scale-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}>
                    {totalCartItems}
                  </span>
                )}
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              style={{
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: '20px',
                padding: '7px 14px',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'var(--transition-fast)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.borderColor = '#fca5a5';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.borderColor = '#fecaca';
              }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Right Action Controls */}
          <div className="navbar-mobile-actions">
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className={`navbar-icon-btn ${mobileSearchOpen ? 'active' : ''}`}
              aria-label="Toggle search"
            >
              <Search size={18} />
            </button>

            {/* Mobile Cart Icon */}
            {userRole !== 'ADMIN' && (
              <button 
                onClick={() => setShowCartDrawer(true)}
                className="navbar-icon-btn"
                aria-label="View shopping cart"
              >
                <ShoppingCart size={18} />
                {totalCartItems > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--primary-500)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 700,
                    width: '17px',
                    height: '17px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 6px rgba(139, 92, 246, 0.8)'
                  }}>
                    {totalCartItems}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`navbar-icon-btn ${mobileMenuOpen ? 'active' : ''}`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Row (Expandable on small screens) */}
        {mobileSearchOpen && (
          <div className="navbar-mobile-search">
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <Search style={{
                position: 'absolute',
                left: '14px',
                color: '#64748b',
                pointerEvents: 'none'
              }} size={16} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '24px',
                  padding: '10px 38px 10px 40px',
                  fontSize: '13px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
                className="form-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Navigation Drawer Modal */}
      {mobileMenuOpen && (
        <>
          <div 
            className="navbar-drawer-backdrop" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="navbar-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header with Close button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="navbar-logo-icon" style={{ width: '32px', height: '32px' }}>
                  <ShoppingBag size={16} />
                </div>
                <span className="navbar-logo-text" style={{ fontSize: '18px' }}>ShopSphere</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="navbar-icon-btn"
                style={{ width: '36px', height: '36px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* User Info Card */}
            <div className="drawer-user-card">
              <div className="drawer-user-avatar">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="drawer-user-info">
                <div className="drawer-user-email" title={userEmail}>
                  {userEmail}
                </div>
                <span 
                  className="drawer-user-role" 
                  style={{
                    background: userRole === 'ADMIN' ? '#ede9fe' : '#ecfdf5',
                    color: userRole === 'ADMIN' ? '#5b21b6' : '#047857',
                    border: `1px solid ${userRole === 'ADMIN' ? '#c4b5fd' : '#a7f3d0'}`
                  }}
                >
                  <ShieldCheck size={12} />
                  {userRole === 'ADMIN' ? 'Admin Access' : 'Verified Customer'}
                </span>
              </div>
            </div>

            {/* Navigation List */}
            <div className="drawer-nav-list">
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '4px' }}>
                Navigation
              </span>

              {userRole !== 'ADMIN' ? (
                <>
                  <button 
                    onClick={() => handleNavClick('products')}
                    className={`drawer-nav-item ${currentTab === 'products' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <ShoppingBag size={18} style={{ color: currentTab === 'products' ? '#4f46e5' : '#64748b' }} />
                      <span>Storefront & Catalog</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('orders')}
                    className={`drawer-nav-item ${currentTab === 'orders' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <Package size={18} style={{ color: currentTab === 'orders' ? '#4f46e5' : '#64748b' }} />
                      <span>My Orders</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('payments')}
                    className={`drawer-nav-item ${currentTab === 'payments' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <CreditCard size={18} style={{ color: currentTab === 'payments' ? '#4f46e5' : '#64748b' }} />
                      <span>My Payments</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('profile')}
                    className={`drawer-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <User size={18} style={{ color: currentTab === 'profile' ? '#4f46e5' : '#64748b' }} />
                      <span>My Profile & Settings</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowCartDrawer(true);
                    }}
                    className="drawer-nav-item"
                    style={{
                      background: '#ede9fe',
                      borderColor: '#c4b5fd'
                    }}
                  >
                    <div className="drawer-nav-item-left">
                      <ShoppingCart size={18} style={{ color: '#4f46e5' }} />
                      <span style={{ color: '#4338ca', fontWeight: 700 }}>Shopping Cart</span>
                    </div>
                    {totalCartItems > 0 && (
                      <span style={{
                        background: 'var(--primary-600)',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        {totalCartItems} items
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleNavClick('overview')}
                    className={`drawer-nav-item ${currentTab === 'overview' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <LayoutDashboard size={18} style={{ color: currentTab === 'overview' ? '#4f46e5' : '#64748b' }} />
                      <span>Overview Dashboard</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('catalog')}
                    className={`drawer-nav-item ${currentTab === 'catalog' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <ShoppingBag size={18} style={{ color: currentTab === 'catalog' ? '#4f46e5' : '#64748b' }} />
                      <span>Manage Catalog (Products & Categories)</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('users')}
                    className={`drawer-nav-item ${currentTab === 'users' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <Users size={18} style={{ color: currentTab === 'users' ? '#4f46e5' : '#64748b' }} />
                      <span>User Management</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('orders')}
                    className={`drawer-nav-item ${currentTab === 'orders' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <Package size={18} style={{ color: currentTab === 'orders' ? '#4f46e5' : '#64748b' }} />
                      <span>Order Management</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('profile')}
                    className={`drawer-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <User size={18} style={{ color: currentTab === 'profile' ? '#4f46e5' : '#64748b' }} />
                      <span>Admin Profile</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>
                </>
              )}
            </div>

            {/* Logout Action */}
            <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-card)' }}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                style={{
                  width: '100%',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  color: '#dc2626',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#fee2e2';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#fef2f2';
                }}
              >
                <LogOut size={16} />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <div className="mobile-bottom-nav-inner">
          {userRole !== 'ADMIN' ? (
            <>
              <button
                onClick={() => handleNavClick('products')}
                className={`mobile-bottom-tab ${currentTab === 'products' ? 'active' : ''}`}
              >
                <div className="mobile-bottom-icon-wrapper">
                  <ShoppingBag size={18} />
                </div>
                <span>Shop</span>
              </button>

              <button
                onClick={() => handleNavClick('orders')}
                className={`mobile-bottom-tab ${currentTab === 'orders' ? 'active' : ''}`}
              >
                <div className="mobile-bottom-icon-wrapper">
                  <Package size={18} />
                </div>
                <span>Orders</span>
              </button>

              <button
                onClick={() => setShowCartDrawer(true)}
                className="mobile-bottom-tab"
              >
                <div className="mobile-bottom-icon-wrapper">
                  <ShoppingCart size={18} />
                  {totalCartItems > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      background: 'var(--primary-500)',
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 700,
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {totalCartItems}
                    </span>
                  )}
                </div>
                <span>Cart</span>
              </button>

              <button
                onClick={() => handleNavClick('payments')}
                className={`mobile-bottom-tab ${currentTab === 'payments' ? 'active' : ''}`}
              >
                <div className="mobile-bottom-icon-wrapper">
                  <CreditCard size={18} />
                </div>
                <span>Payments</span>
              </button>

              <button
                onClick={() => handleNavClick('profile')}
                className={`mobile-bottom-tab ${currentTab === 'profile' ? 'active' : ''}`}
              >
                <div className="mobile-bottom-icon-wrapper">
                  <User size={18} />
                </div>
                <span>Profile</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('overview')}
                className={`mobile-bottom-tab ${currentTab === 'overview' ? 'active' : ''}`}
              >
                <div className="mobile-bottom-icon-wrapper">
                  <LayoutDashboard size={18} />
                </div>
                <span>Overview</span>
              </button>

              <button
                onClick={() => handleNavClick('catalog')}
                className={`mobile-bottom-tab ${currentTab === 'catalog' ? 'active' : ''}`}
              >
                <div className="mobile-bottom-icon-wrapper">
                  <ShoppingBag size={18} />
                </div>
                <span>Catalog</span>
              </button>

              <button
                onClick={() => handleNavClick('users')}
                className={`mobile-bottom-tab ${currentTab === 'users' ? 'active' : ''}`}
              >
                <div className="mobile-bottom-icon-wrapper">
                  <Users size={18} />
                </div>
                <span>Users</span>
              </button>

              <button
                onClick={() => handleNavClick('orders')}
                className={`mobile-bottom-tab ${currentTab === 'orders' ? 'active' : ''}`}
              >
                <div className="mobile-bottom-icon-wrapper">
                  <Package size={18} />
                </div>
                <span>Orders</span>
              </button>

              <button
                onClick={() => handleNavClick('profile')}
                className={`mobile-bottom-tab ${currentTab === 'profile' ? 'active' : ''}`}
              >
                <div className="mobile-bottom-icon-wrapper">
                  <User size={18} />
                </div>
                <span>Profile</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div>
        {currentTab === 'profile' ? (
          <Profile token={token} onBack={() => setCurrentTab(userRole === 'ADMIN' ? 'overview' : 'products')} />
        ) : currentTab === 'users' ? (
          <UsersList token={token} onBack={() => setCurrentTab(userRole === 'ADMIN' ? 'overview' : 'products')} />
        ) : currentTab === 'catalog' ? (
          <CatalogManagement token={token} onBack={() => setCurrentTab(userRole === 'ADMIN' ? 'overview' : 'products')} />
        ) : currentTab === 'orders' ? (
          <div style={{ animation: 'fade-in 0.4s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: '#0f172a' }}>
                  {userRole === 'ADMIN' ? 'Manage Orders' : 'My Orders'}
                </h2>
                <p style={{ color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                  {userRole === 'ADMIN' ? 'View status and details of all customer orders.' : 'View status and details of your placed orders.'}
                </p>
              </div>
              <button
                onClick={() => setCurrentTab(userRole === 'ADMIN' ? 'overview' : 'products')}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '30px',
                  padding: '8px 18px',
                  color: '#1e293b',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#1e293b';
                }}
              >
                {userRole === 'ADMIN' ? 'Back to Overview' : 'Back to Shop'}
              </button>
            </div>

            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(79, 70, 229, 0.1)',
                  borderTop: '3px solid var(--primary-600)',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: '#475569', fontSize: '15px', fontWeight: 500 }}>Loading your orders...</p>
              </div>
            ) : ordersError ? (
              <div style={{
                textAlign: 'center',
                padding: '32px 24px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '16px',
                maxWidth: '480px',
                margin: '0 auto'
              }}>
                <p style={{ color: '#991b1b', fontSize: '14px', fontWeight: 500 }}>
                  Could not fetch orders from the server. ({ordersError})
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 24px',
                background: '#ffffff',
                border: '1.5px dashed #cbd5e1',
                borderRadius: '24px'
              }}>
                <ShoppingBag size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                 <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
                  {userRole === 'ADMIN' ? 'No orders in system' : 'No orders placed yet'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>
                  {userRole === 'ADMIN' ? 'There are currently no customer orders recorded in the system.' : "You haven't placed any orders yet. Browse our catalog and add items to your cart!"}
                </p>
                <button
                  onClick={() => setCurrentTab(userRole === 'ADMIN' ? 'overview' : 'products')}
                  style={{
                    marginTop: '16px',
                    background: 'var(--primary-600)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 22px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-700)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-600)'}
                >
                  {userRole === 'ADMIN' ? 'Back to Overview' : 'Start Shopping'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map((order: any) => (
                  <div key={order.orderId} style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                          Order #{order.orderId}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: order.status === 'CREATED' ? '#dbeafe' : order.status === 'CANCELLED' ? '#fee2e2' : '#d1fae5',
                          color: order.status === 'CREATED' ? '#1d4ed8' : order.status === 'CANCELLED' ? '#b91c1c' : '#047857',
                          textTransform: 'uppercase'
                        }}>
                          {order.status}
                        </span>
                      </div>
                      {userRole === 'ADMIN' && order.userName && (
                        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                          Customer: <strong style={{ color: '#0f172a' }}>{order.userName}</strong> (User #{order.userId})
                        </div>
                      )}
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#4338ca', margin: '0 0 4px' }}>
                        {order.productName}
                      </h4>
                      <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                        Quantity: <strong style={{ color: '#0f172a' }}>{order.quantity}</strong> | Price: <strong style={{ color: '#0f172a' }}>₹{order.price}</strong>
                      </div>
                      {order.status === 'CREATED' && userRole !== 'ADMIN' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
                          <select
                            id={`payment-method-${order.orderId}`}
                            defaultValue="UPI"
                            style={{
                              background: '#ffffff',
                              border: '1.5px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: '#0f172a',
                              fontSize: '13px',
                              fontWeight: 500,
                              outline: 'none'
                            }}
                          >
                            <option value="UPI" style={{ background: '#ffffff', color: '#0f172a' }}>UPI</option>
                            <option value="CARD" style={{ background: '#ffffff', color: '#0f172a' }}>Card</option>
                            <option value="NET_BANKING" style={{ background: '#ffffff', color: '#0f172a' }}>Net Banking</option>
                          </select>
                          <button
                            onClick={() => {
                              const el = document.getElementById(`payment-method-${order.orderId}`) as HTMLSelectElement;
                              handlePayOrder(order.orderId, el ? el.value : 'UPI');
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '7px 14px',
                              color: 'white',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                            }}
                          >
                            Pay Now
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                        Total: ₹{order.totalAmount}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Ordered: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {order.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          style={{
                            marginTop: '8px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            color: '#dc2626',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'var(--transition-fast)'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#fee2e2';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#fef2f2';
                          }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : currentTab === 'payments' ? (
          <div style={{ animation: 'fade-in 0.4s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: '#0f172a' }}>
                  Payment History
                </h2>
                <p style={{ color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                  View details of all your past transactions and payments.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('products')}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '30px',
                  padding: '8px 18px',
                  color: '#1e293b',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#1e293b';
                }}
              >
                Back to Shop
              </button>
            </div>

            {paymentsLoading ? (
              <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(79, 70, 229, 0.1)',
                  borderTop: '3px solid var(--primary-600)',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: '#475569', fontSize: '15px', fontWeight: 500 }}>Loading transaction history...</p>
              </div>
            ) : paymentsError ? (
              <div style={{
                textAlign: 'center',
                padding: '32px 24px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '16px',
                maxWidth: '480px',
                margin: '0 auto'
              }}>
                <p style={{ color: '#991b1b', fontSize: '14px', fontWeight: 500 }}>
                  Could not fetch payments history. ({paymentsError})
                </p>
              </div>
            ) : payments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 24px',
                background: '#ffffff',
                border: '1.5px dashed #cbd5e1',
                borderRadius: '24px'
              }}>
                <ShoppingBag size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>No payments recorded</h3>
                <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>
                  You haven't made any payments yet. Go to your orders to make a payment!
                </p>
                <button
                  onClick={() => setCurrentTab('orders')}
                  style={{
                    marginTop: '16px',
                    background: 'var(--primary-600)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 22px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-700)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-600)'}
                >
                  View My Orders
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {payments.map((payment: any) => (
                  <div key={payment.id} style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                          Transaction ID: {payment.transactionId || `TXN-${payment.id}`}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: payment.paymentStatus === 'SUCCESS' ? '#d1fae5' : payment.paymentStatus === 'PENDING' ? '#fef3c7' : '#fee2e2',
                          color: payment.paymentStatus === 'SUCCESS' ? '#047857' : payment.paymentStatus === 'PENDING' ? '#b45309' : '#b91c1c',
                          textTransform: 'uppercase'
                        }}>
                          {payment.paymentStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#475569', marginBottom: '4px' }}>
                        Order ID: <strong style={{ color: '#0f172a' }}>#{payment.orderId}</strong> | Payment Method: <strong style={{ color: '#0f172a' }}>{payment.paymentMethod}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Status of Order: <span style={{ color: '#4338ca', fontWeight: 600 }}>{payment.orderStatus}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginBottom: '4px' }}>
                        ₹{payment.amount}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Date: {new Date(payment.createdAt).toLocaleDateString()} {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : currentTab === 'overview' ? (
          <div style={{ animation: 'fade-in 0.4s ease-out' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: '#0f172a' }}>
              Admin Control Panel
            </h2>
            <p style={{ color: '#475569', fontSize: '14px', fontWeight: 500, marginBottom: '32px' }}>
              Welcome back! Here is a summary of the store's current catalog and registered users.
            </p>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {/* Products Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e0e7ff',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 4px 16px rgba(99, 102, 246, 0.08)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#ede9fe',
                  border: '1px solid #c4b5fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5'
                }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Products</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {statsLoading ? '...' : totalProducts}
                  </div>
                </div>
              </div>

              {/* Categories Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #d1fae5',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#d1fae5',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669'
                }}>
                  <Tag size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Categories</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {statsLoading ? '...' : totalCategories}
                  </div>
                </div>
              </div>

              {/* Users Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #dbeafe',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.08)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#dbeafe',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb'
                }}>
                  <Users size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Users</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {statsLoading ? '...' : totalUsers}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--border-card)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', fontFamily: 'var(--font-display)', color: '#0f172a' }}>
                System Quick Actions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <button
                  onClick={() => setCurrentTab('catalog')}
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    color: '#0f172a',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'center',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-500)';
                    e.currentTarget.style.background = '#eef2ff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  <ShoppingBag size={24} style={{ color: 'var(--primary-600)' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>Manage Catalog</div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>Add & edit products or categories</div>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentTab('users')}
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    color: '#0f172a',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'center',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-500)';
                    e.currentTarget.style.background = '#eef2ff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  <Users size={24} style={{ color: '#2563eb' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>Manage Users</div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>View store managers and permissions</div>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentTab('profile')}
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    color: '#0f172a',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'center',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-500)';
                    e.currentTarget.style.background = '#eef2ff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  <LayoutDashboard size={24} style={{ color: '#059669' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>Admin Profile</div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>Update profile settings and credentials</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(79, 70, 229, 0.1)',
                  borderTop: '3px solid var(--primary-600)',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: '#475569', fontSize: '15px', fontWeight: 500 }}>Loading products from server...</p>
              </div>
            ) : error ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '16px',
                maxWidth: '480px',
                margin: '32px auto 0'
              }}>
                <X size={40} style={{ color: '#dc2626', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#991b1b' }}>Failed to Load Products</h3>
                <p style={{ color: '#7f1d1d', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
              </div>
            ) : (
              <>
                {/* Category Selection Filter Bar */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                  marginBottom: '32px',
                  scrollbarWidth: 'none'
                }}>
                  {categoryNames.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        background: selectedCategory === category ? 'var(--primary-600)' : '#ffffff',
                        border: '1.5px solid',
                        borderColor: selectedCategory === category ? 'var(--primary-600)' : '#cbd5e1',
                        color: selectedCategory === category ? '#ffffff' : '#334155',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'var(--transition-fast)',
                        boxShadow: selectedCategory === category ? '0 4px 12px rgba(79, 70, 229, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.04)'
                      }}
                      onMouseOver={(e) => {
                        if (selectedCategory !== category) {
                          e.currentTarget.style.borderColor = '#94a3b8';
                          e.currentTarget.style.background = '#f1f5f9';
                          e.currentTarget.style.color = '#0f172a';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedCategory !== category) {
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.background = '#ffffff';
                          e.currentTarget.style.color = '#334155';
                        }
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Results Info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  color: '#475569'
                }}>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>
                    Showing <strong style={{ color: '#0f172a' }}>{filteredProducts.length}</strong> products
                    {selectedCategory !== 'All' && <span> in <strong style={{ color: '#4338ca' }}>{selectedCategory}</strong></span>}
                    {searchQuery && <span> matching "<strong style={{ color: '#4338ca' }}>{searchQuery}</strong>"</span>}
                  </p>
                </div>

                {/* Product Grid (Amazon / Flipkart Style) */}
                {filteredProducts.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '64px 24px',
                    background: '#ffffff',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '24px'
                  }}>
                    <ShoppingBag size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>No products found</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>
                      We couldn't find any products matching your search criteria. Try adjusting your query or filters.
                    </p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                      style={{
                        marginTop: '16px',
                        background: '#ffffff',
                        border: '1.5px solid var(--primary-600)',
                        color: 'var(--primary-600)',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'var(--primary-50)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '24px'
                  }}>
                    {filteredProducts.map((product) => {
                      const badge = product.stock <= 3 ? "Low Stock" : undefined;

                      return (
                        <div
                          key={product.id}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.2s, box-shadow 0.3s',
                            position: 'relative',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.borderColor = '#818cf8';
                            e.currentTarget.style.boxShadow = '0 12px 28px rgba(79, 70, 229, 0.12)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.04)';
                          }}
                        >
                          {/* Badge Tag (for Low Stock) */}
                          {badge && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              zIndex: 10,
                              background: '#ef4444',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '20px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Tag size={10} />
                              <span>{badge}</span>
                            </div>
                          )}

                          {/* Product Image Container */}
                          <div style={{
                            width: '100%',
                            height: '180px',
                            overflow: 'hidden',
                            position: 'relative',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottom: '1px solid #f1f5f9'
                          }}>
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  transition: 'transform 0.5s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              />
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                                <ShoppingBag size={32} />
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>No Image Available</span>
                              </div>
                            )}
                          </div>

                          {/* Content Container */}
                          <div style={{
                            padding: '20px 22px',
                            display: 'flex',
                            flexDirection: 'column',
                            flex: '1',
                            gap: '8px'
                          }}>
                            {/* Category */}
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: 'var(--primary-600)',
                              letterSpacing: '0.05em'
                            }}>
                              {product.categoryName}
                            </span>

                            {/* Title - Fixed height so 1-line and 2-line names occupy identical vertical space */}
                            <h4 style={{
                              fontSize: '16px',
                              fontWeight: 700,
                              lineHeight: '1.35',
                              minHeight: '44px',
                              color: '#0f172a',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              margin: 0
                            }}>
                              {product.name}
                            </h4>

                            {/* Description - Fixed height for uniform alignment */}
                            <p style={{
                              fontSize: '13px',
                              color: '#475569',
                              lineHeight: '1.45',
                              minHeight: '38px',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              margin: 0
                            }}>
                              {product.description || 'Quality product available in our catalog.'}
                            </p>

                            {/* Bottom Action Footer - Anchored to bottom with marginTop: auto for 100% horizontal alignment */}
                            <div style={{
                              marginTop: 'auto',
                              paddingTop: '14px',
                              borderTop: '1px solid #f1f5f9',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              {/* Price Block */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                                  ₹{product.price}
                                </span>
                                <span style={{
                                  fontSize: '11.5px',
                                  color: product.stock > 0 ? '#059669' : '#dc2626',
                                  fontWeight: 700,
                                  background: product.stock > 0 ? '#ecfdf5' : '#fef2f2',
                                  padding: '2px 8px',
                                  borderRadius: '6px'
                                }}>
                                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                              </div>

                              {/* Add to Cart CTA */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                disabled={product.stock <= 0}
                                className="btn-primary"
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  borderRadius: '10px',
                                  gap: '6px',
                                  background: product.stock <= 0
                                    ? '#94a3b8'
                                    : 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                                  boxShadow: product.stock <= 0 ? 'none' : '0 4px 10px rgba(79, 70, 229, 0.2)',
                                  cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
                                  opacity: product.stock <= 0 ? 0.7 : 1
                                }}
                              >
                                <ShoppingCart size={14} />
                                <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(6px)',
          zIndex: 1050,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fade-in 0.2s ease-out'
        }} onClick={() => setShowCartDrawer(false)}>
          <div style={{
            width: '100%',
            maxWidth: '450px',
            background: '#ffffff',
            borderLeft: '1px solid var(--border-card)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.1)',
            animation: 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={20} style={{ color: 'var(--primary-600)' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: '#0f172a' }}>Your Cart</h3>
              </div>
              <button 
                onClick={() => setShowCartDrawer(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#475569',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body (Cart Items) */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: '#ffffff'
            }}>
              {Object.keys(cart).length === 0 ? (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  textAlign: 'center',
                  gap: '12px'
                }}>
                  <ShoppingBag size={48} style={{ color: '#94a3b8' }} />
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Your shopping cart is empty</p>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>Add products from the store to check them out here.</p>
                </div>
              ) : (
                Object.entries(cart).map(([productId, quantity]) => {
                  const prodId = Number(productId);
                  const product = products.find(p => p.id === prodId);
                  if (!product) return null;

                  return (
                    <div key={prodId} style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      alignItems: 'center'
                    }}>
                      {/* Image */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <ShoppingBag size={20} style={{ color: '#94a3b8' }} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h5 style={{
                          margin: '0 0 4px',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>{product.name}</h5>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#4338ca' }}>
                          ₹{product.price}
                        </p>
                      </div>

                      {/* Actions/Quantity */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '3px 8px' }}>
                          <button 
                            onClick={() => {
                              if (quantity > 1) {
                                setCart(prev => ({ ...prev, [prodId]: quantity - 1 }));
                              } else {
                                const newCart = { ...cart };
                                delete newCart[prodId];
                                setCart(newCart);
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', fontWeight: 700 }}
                          >-</button>
                          <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '16px', textAlign: 'center', color: '#0f172a' }}>{quantity}</span>
                          <button 
                            onClick={() => {
                              if (quantity < product.stock) {
                                setCart(prev => ({ ...prev, [prodId]: quantity + 1 }));
                              } else {
                                setToastMessage(`Only ${product.stock} items available in stock.`);
                                setShowCartToast(true);
                                setTimeout(() => setShowCartToast(false), 2000);
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', fontWeight: 700 }}
                          >+</button>
                        </div>
                        <button 
                          onClick={() => {
                            const newCart = { ...cart };
                            delete newCart[prodId];
                            setCart(newCart);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            {Object.keys(cart).length > 0 && (
              <div style={{
                padding: '24px',
                borderTop: '1px solid var(--border-card)',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569', fontSize: '14px', fontWeight: 600 }}>Subtotal</span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                    ₹{Object.entries(cart).reduce((sum, [productId, quantity]) => {
                      const product = products.find(p => p.id === Number(productId));
                      return sum + (product ? product.price * quantity : 0);
                    }, 0)}
                  </span>
                </div>
                <button
                  disabled={placingOrder}
                  onClick={handleCheckout}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                    fontWeight: 700,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {placingOrder ? (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Place Order</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

