import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingCart, LogOut, Tag, Check, ShoppingBag, X, Users, LayoutDashboard } from 'lucide-react';
import { Profile } from './Profile';
import { UsersList } from './UsersList';
import { CatalogManagement } from './CatalogManagement';
import { api } from '../services/api';

// interface Product {
//   id: number;
//   title: string;
//   category: string;
//   price: number;
//   originalPrice: number;
//   rating: number;
//   reviewsCount: number;
//   image: string;
//   badge?: string;
//   description: string;
//   isAssured?: boolean;
// }
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
  const [currentTab, setCurrentTab] = useState<'products' | 'profile' | 'users' | 'catalog' | 'overview'>('products');
  const [userRole, setUserRole] = useState<string | null>(null);
  
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

  const totalCartItems = Object.values(cart).reduce((sum, count) => sum + count, 0);

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 16px 48px' }}>
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

      {/* Navigation Search Bar (Amazon / Flipkart layout style) */}
      <nav style={{
        background: 'rgba(15, 12, 30, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-card)',
        borderRadius: '20px',
        padding: '16px 24px',
        marginTop: '24px',
        marginBottom: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)'
      }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)'
          }}>
            <ShoppingBag style={{ color: 'white', width: '20px', height: '20px' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '22px',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(to right, #ffffff, var(--primary-300))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ShopSphere
          </span>
        </div>

        {/* Search Input Container */}
        <div style={{
          position: 'relative',
          flex: '1 1 350px',
          maxWidth: '500px',
          display: 'flex',
          alignItems: 'center'
        }}>
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
              padding: '12px 20px 12px 48px',
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

        {/* Right Nav Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* User profile identifier */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} className="d-sm-flex">
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Signed in as</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--primary-300)' }}>
              {userEmail.length > 20 ? `${userEmail.slice(0, 18)}...` : userEmail}
            </span>
          </div>

          {/* Shop Navigation Button */}
          {userRole !== 'ADMIN' && currentTab !== 'products' && (
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

          {/* Overview Navigation Button (Admin Only) */}
          {userRole === 'ADMIN' && (
            <button
              onClick={() => setCurrentTab('overview')}
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
              onClick={() => setCurrentTab('catalog')}
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
              onClick={() => setCurrentTab('users')}
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

          {/* Profile Navigation Button */}
          <button
            onClick={() => setCurrentTab('profile')}
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
            <div style={{ position: 'relative', cursor: 'pointer', padding: '6px' }}>
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
      </nav>

      {/* Main Content Area */}
      <div>
        {currentTab === 'profile' ? (
          <Profile token={token} onBack={() => setCurrentTab(userRole === 'ADMIN' ? 'overview' : 'products')} />
        ) : currentTab === 'users' ? (
          <UsersList token={token} onBack={() => setCurrentTab(userRole === 'ADMIN' ? 'overview' : 'products')} />
        ) : currentTab === 'catalog' ? (
          <CatalogManagement token={token} onBack={() => setCurrentTab(userRole === 'ADMIN' ? 'overview' : 'products')} />
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
    </div>
  );
};
