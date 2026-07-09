import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, LogOut, Star, Tag, ShieldCheck, Check, ShoppingBag, X } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  description: string;
  isAssured?: boolean;
}

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

const PRODUCTS_MOCK: Product[] = [
  {
    id: 1,
    title: "Apex Wireless Noise-Cancelling Headphones",
    category: "Tech",
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    reviewsCount: 824,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    badge: "Best Seller",
    description: "Experience premium sound with industry-leading hybrid active noise cancelling technology.",
    isAssured: true
  },
  {
    id: 2,
    title: "Titan Smartwatch Series 5",
    category: "Tech",
    price: 199,
    originalPrice: 249,
    rating: 4.7,
    reviewsCount: 1150,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
    badge: "20% OFF",
    description: "Track your health, receive notifications, and enjoy a gorgeous 1.9-inch AMOLED display.",
    isAssured: true
  },
  {
    id: 3,
    title: "AeroGrip Mechanical Gaming Keyboard",
    category: "Tech",
    price: 129,
    originalPrice: 159,
    rating: 4.9,
    reviewsCount: 340,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80",
    description: "Ultra-responsive brown switches with fully customizable dynamic RGB backlighting.",
    isAssured: false
  },
  {
    id: 4,
    title: "Nomad Full-Grain Leather Travel Duffle",
    category: "Accessories",
    price: 89,
    originalPrice: 120,
    rating: 4.6,
    reviewsCount: 120,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80",
    badge: "Hot Deal",
    description: "Handcrafted travel duffle bag designed with durable waterproof zippers and dedicated shoe pocket.",
    isAssured: true
  },
  {
    id: 5,
    title: "Vanguard Minimalist Carbon Fiber Wallet",
    category: "Accessories",
    price: 45,
    originalPrice: 60,
    rating: 4.5,
    reviewsCount: 450,
    image: "https://images.unsplash.com/photo-1627124765135-566b50ad24ab?w=500&auto=format&fit=crop&q=80",
    description: "RFID-blocking slim cardholder that holds up to 12 cards without stretching out.",
    isAssured: false
  },
  {
    id: 6,
    title: "OmniFit Ergonomic Breathable Office Chair",
    category: "Home",
    price: 349,
    originalPrice: 499,
    rating: 4.8,
    reviewsCount: 98,
    image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=80",
    badge: "Top Rated",
    description: "Complete adjustable lumbo-sacral support system with high-density mesh and reclining locks.",
    isAssured: true
  },
  {
    id: 7,
    title: "Prime Cotton Oversized Fit Tee",
    category: "Apparel",
    price: 28,
    originalPrice: 35,
    rating: 4.4,
    reviewsCount: 1230,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
    description: "Super soft 240GSM heavyweight cotton fabric with dropping shoulder silhouette.",
    isAssured: false
  },
  {
    id: 8,
    title: "Aura Ceramic Essential Oil Diffuser",
    category: "Home",
    price: 38,
    originalPrice: 48,
    rating: 4.7,
    reviewsCount: 610,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=80",
    description: "Minimalist ceramic ultrasonic diffuser with ambient warm-light glow modes.",
    isAssured: true
  }
];

export const Dashboard: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<{ [productId: number]: number }>({});
  const [showCartToast, setShowCartToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(PRODUCTS_MOCK.map((p) => p.category)))];
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS_MOCK.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => ({
      ...prevCart,
      [product.id]: (prevCart[product.id] || 0) + 1
    }));
    setToastMessage(`Added "${product.title}" to cart!`);
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

          {/* Cart Icon */}
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
        {/* Category Selection Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '32px',
          scrollbarWidth: 'none'
        }}>
          {categories.map((category) => (
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
              const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              
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
                  {/* Badge Tag */}
                  {product.badge && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      zIndex: 10,
                      background: product.badge.includes('OFF') ? '#ef4444' : 'var(--primary-600)',
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
                      <span>{product.badge}</span>
                    </div>
                  )}

                  {/* Product Image Container */}
                  <div style={{
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'rgba(0,0,0,0.2)'
                  }}>
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>

                  {/* Content Container */}
                  <div style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1'
                  }}>
                    {/* Category */}
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: 'var(--primary-400)',
                      letterSpacing: '0.05em',
                      marginBottom: '8px'
                    }}>
                      {product.category}
                    </span>

                    {/* Title */}
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: '1.4',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '44px'
                    }}>
                      {product.title}
                    </h4>

                    {/* Star Rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b' }}>
                        <Star size={14} fill="#f59e0b" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginLeft: '4px' }}>
                          {product.rating}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        ({product.reviewsCount.toLocaleString()})
                      </span>

                      {product.isAssured && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: '4px',
                          padding: '1px 4px',
                          marginLeft: 'auto'
                        }}>
                          <ShieldCheck size={11} style={{ color: '#3b82f6' }} />
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#60a5fa' }}>ASSURED</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '36px'
                    }}>
                      {product.description}
                    </p>

                    {/* Price Block */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '8px',
                      marginTop: 'auto',
                      marginBottom: '16px'
                    }}>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>
                        ${product.price}
                      </span>
                      <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                        ${product.originalPrice}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>
                        ({discountPercentage}% off)
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
      </div>
    </div>
  );
};
