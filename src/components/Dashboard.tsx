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
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }} size={18} />
            <input
              type="text"
              placeholder="Search products, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-card)',
                borderRadius: '30px',
                padding: '12px 42px 12px 48px',
                fontSize: '14px',
                color: 'var(--text-primary)',
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
                  color: 'var(--text-secondary)',
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Signed in as</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--primary-300)' }}>
                {userEmail.length > 18 ? `${userEmail.slice(0, 16)}...` : userEmail}
              </span>
            </div>

            {/* Shop Navigation Button */}
            {userRole !== 'ADMIN' && currentTab !== 'products' && (
              <button
                onClick={() => handleNavClick('products')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
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
                  background: currentTab === 'orders' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = currentTab === 'orders' ? 'var(--primary-700)' : 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = currentTab === 'orders' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)';
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
                  background: currentTab === 'payments' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = currentTab === 'payments' ? 'var(--primary-700)' : 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = currentTab === 'payments' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)';
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
                  background: currentTab === 'overview' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = currentTab === 'overview' ? 'var(--primary-700)' : 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = currentTab === 'overview' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)';
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
                  background: currentTab === 'catalog' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = currentTab === 'catalog' ? 'var(--primary-700)' : 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = currentTab === 'catalog' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <ShoppingBag size={14} />
                <span>Manage Catalog</span>
              </button>
            )}

            {/* Users Navigation Button (Admin Only) */}
            {userRole === 'ADMIN' && (
              <button
                onClick={() => handleNavClick('users')}
                style={{
                  background: currentTab === 'users' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = currentTab === 'users' ? 'var(--primary-700)' : 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = currentTab === 'users' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)';
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
                  background: currentTab === 'orders' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = currentTab === 'orders' ? 'var(--primary-700)' : 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = currentTab === 'orders' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)';
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
                background: currentTab === 'profile' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-card)',
                borderRadius: '30px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = currentTab === 'profile' ? 'var(--primary-700)' : 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = currentTab === 'profile' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.05)';
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
                <ShoppingCart size={22} style={{ color: 'var(--text-primary)', opacity: 0.9 }} />
                {totalCartItems > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: 'var(--primary-500)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)',
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
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '30px',
                padding: '8px 16px',
                color: '#fca5a5',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              <LogOut size={16} />
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
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }} size={16} />
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '24px',
                  padding: '10px 38px 10px 40px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
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
                    color: 'var(--text-secondary)',
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
                    background: userRole === 'ADMIN' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    color: userRole === 'ADMIN' ? '#c4b5fd' : '#6ee7b7',
                    border: `1px solid ${userRole === 'ADMIN' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(16, 185, 129, 0.25)'}`
                  }}
                >
                  <ShieldCheck size={12} />
                  {userRole === 'ADMIN' ? 'Admin Access' : 'Verified Customer'}
                </span>
              </div>
            </div>

            {/* Navigation List */}
            <div className="drawer-nav-list">
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '4px' }}>
                Navigation
              </span>

              {userRole !== 'ADMIN' ? (
                <>
                  <button 
                    onClick={() => handleNavClick('products')}
                    className={`drawer-nav-item ${currentTab === 'products' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <ShoppingBag size={18} style={{ color: currentTab === 'products' ? 'var(--primary-300)' : 'var(--text-muted)' }} />
                      <span>Storefront & Catalog</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('orders')}
                    className={`drawer-nav-item ${currentTab === 'orders' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <Package size={18} style={{ color: currentTab === 'orders' ? 'var(--primary-300)' : 'var(--text-muted)' }} />
                      <span>My Orders</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('payments')}
                    className={`drawer-nav-item ${currentTab === 'payments' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <CreditCard size={18} style={{ color: currentTab === 'payments' ? 'var(--primary-300)' : 'var(--text-muted)' }} />
                      <span>My Payments</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('profile')}
                    className={`drawer-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <User size={18} style={{ color: currentTab === 'profile' ? 'var(--primary-300)' : 'var(--text-muted)' }} />
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
                      background: 'rgba(139, 92, 246, 0.08)',
                      borderColor: 'rgba(139, 92, 246, 0.2)'
                    }}
                  >
                    <div className="drawer-nav-item-left">
                      <ShoppingCart size={18} style={{ color: 'var(--primary-400)' }} />
                      <span style={{ color: 'white', fontWeight: 600 }}>Shopping Cart</span>
                    </div>
                    {totalCartItems > 0 && (
                      <span style={{
                        background: 'var(--primary-500)',
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
                      <LayoutDashboard size={18} style={{ color: currentTab === 'overview' ? 'var(--primary-300)' : 'var(--text-muted)' }} />
                      <span>Overview Dashboard</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('catalog')}
                    className={`drawer-nav-item ${currentTab === 'catalog' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <ShoppingBag size={18} style={{ color: currentTab === 'catalog' ? 'var(--primary-300)' : 'var(--text-muted)' }} />
                      <span>Manage Catalog (Products & Categories)</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('users')}
                    className={`drawer-nav-item ${currentTab === 'users' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <Users size={18} style={{ color: currentTab === 'users' ? 'var(--primary-300)' : 'var(--text-muted)' }} />
                      <span>User Management</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('orders')}
                    className={`drawer-nav-item ${currentTab === 'orders' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <Package size={18} style={{ color: currentTab === 'orders' ? 'var(--primary-300)' : 'var(--text-muted)' }} />
                      <span>Order Management</span>
                    </div>
                    <ChevronRight size={16} opacity={0.6} />
                  </button>

                  <button 
                    onClick={() => handleNavClick('profile')}
                    className={`drawer-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
                  >
                    <div className="drawer-nav-item-left">
                      <User size={18} style={{ color: currentTab === 'profile' ? 'var(--primary-300)' : 'var(--text-muted)' }} />
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
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  color: '#fca5a5',
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
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
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
                <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                  {userRole === 'ADMIN' ? 'Manage Orders' : 'My Orders'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {userRole === 'ADMIN' ? 'View status and details of all customer orders.' : 'View status and details of your placed orders.'}
                </p>
              </div>
              <button
                onClick={() => setCurrentTab(userRole === 'ADMIN' ? 'overview' : 'products')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
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
                  border: '3px solid rgba(139, 92, 246, 0.1)',
                  borderTop: '3px solid var(--primary-500)',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Loading your orders...</p>
              </div>
            ) : ordersError ? (
              <div style={{
                textAlign: 'center',
                padding: '32px 24px',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '16px',
                maxWidth: '480px',
                margin: '0 auto'
              }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Could not fetch orders from the server. ({ordersError})
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 24px',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px dashed var(--border-card)',
                borderRadius: '24px'
              }}>
                <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                 <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  {userRole === 'ADMIN' ? 'No orders in system' : 'No orders placed yet'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>
                  {userRole === 'ADMIN' ? 'There are currently no customer orders recorded in the system.' : "You haven't placed any orders yet. Browse our catalog and add items to your cart!"}
                </p>
                <button
                  onClick={() => setCurrentTab(userRole === 'ADMIN' ? 'overview' : 'products')}
                  style={{
                    marginTop: '16px',
                    background: 'var(--primary-600)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
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
                    background: 'rgba(15, 12, 30, 0.4)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
                          Order #{order.orderId}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: order.status === 'CREATED' ? 'rgba(59, 130, 246, 0.15)' : order.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: order.status === 'CREATED' ? '#60a5fa' : order.status === 'CANCELLED' ? '#f87171' : '#34d399',
                          textTransform: 'uppercase'
                        }}>
                          {order.status}
                        </span>
                      </div>
                      {userRole === 'ADMIN' && order.userName && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Customer: <strong>{order.userName}</strong> (User #{order.userId})
                        </div>
                      )}
                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary-300)', margin: '0 0 4px' }}>
                        {order.productName}
                      </h4>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Quantity: {order.quantity} | Price: ₹{order.price}
                      </div>
                      {order.status === 'CREATED' && userRole !== 'ADMIN' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
                          <select
                            id={`payment-method-${order.orderId}`}
                            defaultValue="UPI"
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-card)',
                              borderRadius: '8px',
                              padding: '5px 8px',
                              color: 'white',
                              fontSize: '12px',
                              outline: 'none'
                            }}
                          >
                            <option value="UPI" style={{ background: '#0d0a1b' }}>UPI</option>
                            <option value="CARD" style={{ background: '#0d0a1b' }}>Card</option>
                            <option value="NET_BANKING" style={{ background: '#0d0a1b' }}>Net Banking</option>
                          </select>
                          <button
                            onClick={() => {
                              const el = document.getElementById(`payment-method-${order.orderId}`) as HTMLSelectElement;
                              handlePayOrder(order.orderId, el ? el.value : 'UPI');
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            Pay Now
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                        Total: ₹{order.totalAmount}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Ordered: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {order.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          style={{
                            marginTop: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            color: '#fca5a5',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'var(--transition-fast)'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
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
                <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                  Payment History
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  View details of all your past transactions and payments.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('products')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
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
                  border: '3px solid rgba(139, 92, 246, 0.1)',
                  borderTop: '3px solid var(--primary-500)',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Loading transaction history...</p>
              </div>
            ) : paymentsError ? (
              <div style={{
                textAlign: 'center',
                padding: '32px 24px',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '16px',
                maxWidth: '480px',
                margin: '0 auto'
              }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Could not fetch payments history. ({paymentsError})
                </p>
              </div>
            ) : payments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 24px',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px dashed var(--border-card)',
                borderRadius: '24px'
              }}>
                <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No payments recorded</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>
                  You haven't made any payments yet. Go to your orders to make a payment!
                </p>
                <button
                  onClick={() => setCurrentTab('orders')}
                  style={{
                    marginTop: '16px',
                    background: 'var(--primary-600)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
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
                    background: 'rgba(15, 12, 30, 0.4)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
                          Transaction ID: {payment.transactionId || `TXN-${payment.id}`}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: payment.paymentStatus === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : payment.paymentStatus === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: payment.paymentStatus === 'SUCCESS' ? '#34d399' : payment.paymentStatus === 'PENDING' ? '#fbbf24' : '#f87171',
                          textTransform: 'uppercase'
                        }}>
                          {payment.paymentStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Order ID: <strong style={{ color: 'white' }}>#{payment.orderId}</strong> | Payment Method: <strong>{payment.paymentMethod}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Status of Order: <span style={{ color: 'var(--primary-300)' }}>{payment.orderStatus}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>
                        ₹{payment.amount}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
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
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              Admin Control Panel
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
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
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.03) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-400)'
                }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Products</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'white', marginTop: '4px' }}>
                    {statsLoading ? '...' : totalProducts}
                  </div>
                </div>
              </div>

              {/* Categories Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.03) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399'
                }}>
                  <Tag size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Categories</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'white', marginTop: '4px' }}>
                    {statsLoading ? '...' : totalCategories}
                  </div>
                </div>
              </div>

              {/* Users Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.03) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa'
                }}>
                  <Users size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Users</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'white', marginTop: '4px' }}>
                    {statsLoading ? '...' : totalUsers}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div style={{
              background: 'rgba(15, 12, 30, 0.4)',
              border: '1px solid var(--border-card)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
                System Quick Actions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <button
                  onClick={() => setCurrentTab('catalog')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '16px',
                    padding: '20px',
                    color: 'white',
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
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-card)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <ShoppingBag size={24} style={{ color: 'var(--primary-400)' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Manage Catalog</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '4px' }}>Add & edit products or categories</div>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentTab('users')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '16px',
                    padding: '20px',
                    color: 'white',
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
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-card)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <Users size={24} style={{ color: '#60a5fa' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Manage Users</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '4px' }}>View store managers and permissions</div>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentTab('profile')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '16px',
                    padding: '20px',
                    color: 'white',
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
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-card)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <LayoutDashboard size={24} style={{ color: '#34d399' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Admin Profile</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '4px' }}>Update profile settings and credentials</div>
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
                  border: '3px solid rgba(139, 92, 246, 0.1)',
                  borderTop: '3px solid var(--primary-500)',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Loading products from server...</p>
              </div>
            ) : error ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '16px',
                maxWidth: '480px',
                margin: '32px auto 0'
              }}>
                <X size={40} style={{ color: '#ef4444', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#f87171' }}>Failed to Load Products</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
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
                        background: selectedCategory === category ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid',
                        borderColor: selectedCategory === category ? 'var(--primary-500)' : 'var(--border-card)',
                        color: selectedCategory === category ? 'white' : 'var(--text-secondary)',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'var(--transition-fast)',
                        boxShadow: selectedCategory === category ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none'
                      }}
                      onMouseOver={(e) => {
                        if (selectedCategory !== category) {
                          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedCategory !== category) {
                          e.currentTarget.style.borderColor = 'var(--border-card)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
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
                  color: 'var(--text-secondary)'
                }}>
                  <p style={{ fontSize: '14px' }}>
                    Showing <strong>{filteredProducts.length}</strong> products
                    {selectedCategory !== 'All' && <span> in <strong style={{ color: 'var(--primary-300)' }}>{selectedCategory}</strong></span>}
                    {searchQuery && <span> matching "<strong style={{ color: 'var(--primary-300)' }}>{searchQuery}</strong>"</span>}
                  </p>
                </div>

                {/* Product Grid (Amazon / Flipkart Style) */}
                {filteredProducts.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '64px 24px',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px dashed var(--border-card)',
                    borderRadius: '24px'
                  }}>
                    <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No products found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>
                      We couldn't find any products matching your search criteria. Try adjusting your query or filters.
                    </p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                      style={{
                        marginTop: '16px',
                        background: 'none',
                        border: '1px solid var(--primary-500)',
                        color: 'var(--primary-300)',
                        padding: '8px 18px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'none'}
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
                            background: 'rgba(15, 12, 30, 0.4)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--border-card)',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.2s, box-shadow 0.3s',
                            position: 'relative',
                            cursor: 'pointer'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.25)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(139, 92, 246, 0.1)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.borderColor = 'var(--border-card)';
                            e.currentTarget.style.boxShadow = 'none';
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
                            background: 'rgba(255, 255, 255, 0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottom: '1px solid var(--border-card)'
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
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                <ShoppingBag size={32} />
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>No Image Available</span>
                              </div>
                            )}
                          </div>

                          {/* Content Container */}
                          <div style={{
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            flex: '1',
                            gap: '12px'
                          }}>
                            {/* Category */}
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              color: 'var(--primary-400)',
                              letterSpacing: '0.05em'
                            }}>
                              {product.categoryName}
                            </span>

                            {/* Title */}
                            <h4 style={{
                              fontSize: '18px',
                              fontWeight: 600,
                              lineHeight: '1.4',
                              color: 'var(--text-primary)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              margin: 0
                            }}>
                              {product.name}
                            </h4>

                            {/* Description */}
                            <p style={{
                              fontSize: '13px',
                              color: 'var(--text-secondary)',
                              lineHeight: '1.5',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              margin: 0
                            }}>
                              {product.description}
                            </p>

                            {/* Price Block */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: '8px'
                            }}>
                              <span style={{ fontSize: '22px', fontWeight: 700, color: 'white' }}>
                                ₹{product.price}
                              </span>
                              <span style={{ fontSize: '12px', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                              </span>
                            </div>

                            {/* Add to Cart CTA */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              className="btn-primary"
                              style={{
                                padding: '10px 14px',
                                fontSize: '13px',
                                borderRadius: '8px',
                                gap: '6px',
                                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
                                boxShadow: '0 4px 8px rgba(124, 58, 237, 0.15)'
                              }}
                            >
                              <ShoppingCart size={14} />
                              <span>Add to Cart</span>
                            </button>
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
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1050,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fade-in 0.2s ease-out'
        }} onClick={() => setShowCartDrawer(false)}>
          <div style={{
            width: '100%',
            maxWidth: '450px',
            background: '#0d0a1b',
            borderLeft: '1px solid var(--border-card)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
            animation: 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={20} style={{ color: 'var(--primary-400)' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)' }}>Your Cart</h3>
              </div>
              <button 
                onClick={() => setShowCartDrawer(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body (Cart Items) */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {Object.keys(cart).length === 0 ? (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  gap: '12px'
                }}>
                  <ShoppingBag size={48} />
                  <p style={{ margin: 0, fontSize: '15px' }}>Your shopping cart is empty</p>
                  <p style={{ margin: 0, fontSize: '13px', opacity: 0.7 }}>Add products from the store to check them out here.</p>
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
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '12px',
                      alignItems: 'center'
                    }}>
                      {/* Image */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <ShoppingBag size={20} style={{ color: 'var(--text-muted)' }} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h5 style={{
                          margin: '0 0 4px',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>{product.name}</h5>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--primary-300)' }}>
                          ₹{product.price}
                        </p>
                      </div>

                      {/* Actions/Quantity */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '2px 6px' }}>
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
                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                          >-</button>
                          <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{quantity}</span>
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
                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
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
                            color: '#ef4444',
                            fontSize: '11px',
                            fontWeight: 500,
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
                background: 'rgba(15, 12, 30, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Subtotal</span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>
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
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
                    fontWeight: 600,
                    fontSize: '14px',
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
                      border: '2px solid rgba(255,255,255,0.2)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <>
                      <Check size={16} />
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

