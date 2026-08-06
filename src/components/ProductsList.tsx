import React, { useEffect, useState, useMemo } from 'react';
import { ShoppingBag, Plus, Search, RefreshCw, AlertCircle, X, Tag, IndianRupee, Archive, Edit2, Trash2 } from 'lucide-react';
import { api } from '../services/api';

interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryOption {
  id: number;
  name: string;
}

interface ProductsListProps {
  token: string;
  onBack: () => void;
}

export const ProductsList: React.FC<ProductsListProps> = ({ token, onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Creation modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createCategoryId, setCreateCategoryId] = useState<number | ''>('');
  const [createPrice, setCreatePrice] = useState<number | ''>('');
  const [createStock, setCreateStock] = useState<number | ''>('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<number | ''>('');
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [editStock, setEditStock] = useState<number | ''>('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete modal/action states
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getProducts(token, page, 10, 'id', 'asc');
      
      const fetchedContent = response?.data?.content || [];
      setProducts(fetchedContent);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setError(err.message || 'An unexpected error occurred while fetching products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch categories options for form dropdown (large size to get all of them)
      const response = await api.getCategories(token, 0, 100, 'name', 'asc');
      const fetchedCategories = response?.data?.content || [];
      setCategories(fetchedCategories.map((c: any) => ({ id: c.id, name: c.name })));
    } catch (err) {
      console.error('Failed to load category options:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token, page]);

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(searchLower) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(searchLower)) ||
        p.description.toLowerCase().includes(searchLower)
      );
    });
  }, [products, searchQuery]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      setCreateError('Product name is required.');
      return;
    }
    if (createCategoryId === '') {
      setCreateError('Please select a category.');
      return;
    }
    if (createPrice === '' || createPrice < 0) {
      setCreateError('Please enter a valid price (0 or greater).');
      return;
    }
    if (createStock === '' || createStock < 0) {
      setCreateError('Please enter a valid stock level (0 or greater).');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);
      await api.createProduct(token, {
        name: createName.trim(),
        description: createDescription.trim(),
        categoryId: Number(createCategoryId),
        price: Number(createPrice),
        stock: Number(createStock)
      });

      // Clear fields on success
      setCreateName('');
      setCreateDescription('');
      setCreateCategoryId('');
      setCreatePrice('');
      setCreateStock('');
      setCreateError(null);
      setShowCreateModal(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Create product error:', err);
      setCreateError(err.message || 'Failed to create product.');
    } finally {
      setCreateLoading(false);
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditDescription(product.description || '');
    setEditCategoryId(product.categoryId);
    setEditPrice(product.price);
    setEditStock(product.stock);
    setEditError(null);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editName.trim()) {
      setEditError('Product name is required.');
      return;
    }
    if (editCategoryId === '') {
      setEditError('Please select a category.');
      return;
    }
    if (editPrice === '' || editPrice < 0) {
      setEditError('Please enter a valid price (0 or greater).');
      return;
    }
    if (editStock === '' || editStock < 0) {
      setEditError('Please enter a valid stock level (0 or greater).');
      return;
    }

    try {
      setEditLoading(true);
      setEditError(null);
      await api.updateProduct(token, editingProduct.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        categoryId: Number(editCategoryId),
        price: Number(editPrice),
        stock: Number(editStock)
      });
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.error('Update product error:', err);
      setEditError(err.message || 'Failed to update product.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await api.deleteProduct(token, deletingProduct.id);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.error('Delete product error:', err);
      setDeleteError(err.message || 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
    }
  };



  return (
    <div style={{ width: '100%', animation: 'fade-in 0.4s ease-out' }}>
      {/* Header section with back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-300)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '10px',
              padding: '4px 0',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'white'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--primary-300)'}
          >
            ← Back to Storefront
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-400)'
            }}>
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                Store Products
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Manage catalog items, pricing structures, and inventory levels
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
              border: 'none',
              color: 'white',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <Plus size={14} />
            <span>Create Product</span>
          </button>

          <button
            onClick={fetchProducts}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-primary)',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        background: 'rgba(15, 12, 30, 0.4)',
        border: '1px solid var(--border-card)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by product name, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-card)',
              borderRadius: '24px',
              padding: '10px 16px 10px 42px',
              fontSize: '14px',
              color: 'white',
              outline: 'none',
              transition: 'var(--transition-smooth)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid / Table */}
      {loading ? (
        <div style={{
          background: 'rgba(15, 12, 30, 0.2)',
          border: '1px solid var(--border-card)',
          borderRadius: '20px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <div className="spin-animation" style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(139, 92, 246, 0.1)',
            borderTop: '3px solid var(--primary-500)',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading store products...</p>
        </div>
      ) : error ? (
        <div style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: '20px',
          padding: '32px 24px',
          textAlign: 'center',
          maxWidth: '480px',
          margin: '0 auto'
        }}>
          <AlertCircle size={36} style={{ color: 'var(--error)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f87171', marginBottom: '6px' }}>Failed to retrieve products</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={fetchProducts}
            style={{
              background: 'var(--primary-600)',
              border: 'none',
              color: 'white',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{
          background: 'rgba(15, 12, 30, 0.2)',
          border: '1px dashed var(--border-card)',
          borderRadius: '20px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <ShoppingBag size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>No products found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto' }}>
            We couldn't find any products matching your search query.
          </p>
        </div>
      ) : (
        <div style={{
          background: 'rgba(15, 12, 30, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-card)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Details</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  return (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom: '1px solid var(--border-card)',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Product Name */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'rgba(139, 92, 246, 0.08)',
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--primary-300)'
                          }}>
                            <ShoppingBag size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>
                              {product.name}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                              ID: #{product.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No description</span>}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.15)', fontSize: '12px', color: 'var(--primary-300)', fontWeight: 500 }}>
                          <Tag size={12} />
                          <span>{product.categoryName || `ID: ${product.categoryId}`}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: 'white' }}>
                          <IndianRupee size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{product.price.toFixed(2)}</span>
                        </div>
                      </td>

                      {/* Stock */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: product.stock === 0 ? '#ef4444' : product.stock < 10 ? '#f59e0b' : 'white' }}>
                          <Archive size={13} style={{ opacity: 0.7 }} />
                          <span>{product.stock} pcs</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => startEditProduct(product)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid var(--border-card)',
                              color: 'var(--primary-300)',
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'var(--transition-fast)'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                              e.currentTarget.style.color = 'var(--primary-200)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                              e.currentTarget.style.color = 'var(--primary-300)';
                            }}
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid var(--border-card)',
                              color: '#ef4444',
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'var(--transition-fast)'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                              e.currentTarget.style.color = '#f87171';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                              e.currentTarget.style.color = '#ef4444';
                            }}
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div style={{ padding: '16px 24px', background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing <strong>{filteredProducts.length}</strong> of <strong>{totalElements}</strong> products
            </span>
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-card)',
                    color: page === 0 ? 'var(--text-muted)' : 'white',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: page === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '13px', color: 'white', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-card)',
                    color: page >= totalPages - 1 ? 'var(--text-muted)' : 'white',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Product Modal Overlay */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1100,
          background: 'rgba(3, 0, 20, 0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fade-in 0.25s ease-out'
        }}
        onClick={() => {
          setShowCreateModal(false);
          setCreateError(null);
        }}
        >
          <div style={{
            background: 'rgba(15, 12, 30, 0.95)',
            border: '1px solid var(--border-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.15)',
            overflow: 'hidden',
            animation: 'scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-card)',
              background: 'rgba(255, 255, 255, 0.01)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: 'var(--primary-400)' }} />
                <span>Create New Product</span>
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateProduct}>
              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                {createError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#f87171',
                    fontSize: '13px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{createError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Product Name <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wireless Mouse, Mechanical Keyboard"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    disabled={createLoading}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Category Dropdown */}
                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Category <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <select
                    value={createCategoryId}
                    onChange={(e) => setCreateCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={createLoading}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 12, 30, 0.95)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="" style={{ background: 'var(--bg-main)' }}>Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: 'var(--bg-main)' }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price & Stock inline */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '18px' }}>
                  {/* Price */}
                  <div className="form-group" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Price (INR) <span style={{ color: 'var(--error)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 799"
                      value={createPrice}
                      onChange={(e) => setCreatePrice(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={createLoading}
                      min={0}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-card)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Stock */}
                  <div className="form-group" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Stock Quantity <span style={{ color: 'var(--error)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={createStock}
                      onChange={(e) => setCreateStock(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={createLoading}
                      min={0}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-card)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Description
                  </label>
                  <textarea
                    placeholder="Provide detailed description of this product..."
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    disabled={createLoading}
                    rows={4}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-card)',
                background: 'rgba(255, 255, 255, 0.01)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError(null);
                  }}
                  disabled={createLoading}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-card)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="btn-primary"
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {createLoading ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal Overlay */}
      {editingProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1100,
          background: 'rgba(3, 0, 20, 0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fade-in 0.25s ease-out'
        }}
        onClick={() => {
          setEditingProduct(null);
          setEditError(null);
        }}
        >
          <div style={{
            background: 'rgba(15, 12, 30, 0.95)',
            border: '1px solid var(--border-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.15)',
            overflow: 'hidden',
            animation: 'scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-card)',
              background: 'rgba(255, 255, 255, 0.01)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} style={{ color: 'var(--primary-400)' }} />
                <span>Edit Product</span>
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setEditError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleUpdateProduct}>
              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                {editError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#f87171',
                    fontSize: '13px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{editError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Product Name <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wireless Mouse, Mechanical Keyboard"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={editLoading}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Category Dropdown */}
                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Category <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={editLoading}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 12, 30, 0.95)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="" style={{ background: 'var(--bg-main)' }}>Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: 'var(--bg-main)' }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price & Stock inline */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '18px' }}>
                  {/* Price */}
                  <div className="form-group" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Price (INR) <span style={{ color: 'var(--error)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 799"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={editLoading}
                      min={0}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-card)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Stock */}
                  <div className="form-group" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Stock Quantity <span style={{ color: 'var(--error)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={editLoading}
                      min={0}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-card)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Description
                  </label>
                  <textarea
                    placeholder="Provide detailed description of this product..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    disabled={editLoading}
                    rows={4}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-card)',
                background: 'rgba(255, 255, 255, 0.01)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setEditError(null);
                  }}
                  disabled={editLoading}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-card)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn-primary"
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deletingProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1100,
          background: 'rgba(3, 0, 20, 0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fade-in 0.25s ease-out'
        }}
        onClick={() => {
          setDeletingProduct(null);
          setDeleteError(null);
        }}
        >
          <div style={{
            background: 'rgba(15, 12, 30, 0.95)',
            border: '1px solid var(--border-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.1)',
            overflow: 'hidden',
            animation: 'scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                marginBottom: '20px'
              }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', fontFamily: 'var(--font-display)' }}>
                Delete Product
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{deletingProduct.name}</strong>? This action cannot be undone and will permanently remove the product from the catalog.
              </p>

              {deleteError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#f87171',
                  fontSize: '13px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{deleteError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => {
                    setDeletingProduct(null);
                    setDeleteError(null);
                  }}
                  disabled={deleteLoading}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-card)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  disabled={deleteLoading}
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
