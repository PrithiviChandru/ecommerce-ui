import React, { useEffect, useState, useMemo } from 'react';
import { Tag, Search, FolderOpen, Calendar, Clock, RefreshCw, AlertCircle, X, Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '../services/api';

interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesListProps {
  token: string;
  onBack: () => void;
}

export const CategoriesList: React.FC<CategoriesListProps> = ({ token, onBack }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states matching backend response
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Create Category States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      setCreateError('Category name is required.');
      return;
    }
    try {
      setCreateLoading(true);
      setCreateError(null);
      await api.createCategory(token, {
        name: createName.trim(),
        description: createDescription.trim()
      });
      setCreateName('');
      setCreateDescription('');
      setCreateError(null);
      setShowCreateModal(false);
      fetchCategories();
    } catch (err: any) {
      console.error('Create category error:', err);
      setCreateError(err.message || 'Failed to create category.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Edit Category States
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const startEditCategory = (id: number) => {
    // Retrieve by ID from list data
    const categoryToEdit = categories.find((c) => c.id === id);
    if (categoryToEdit) {
      setEditingCategory(categoryToEdit);
      setEditName(categoryToEdit.name);
      setEditDescription(categoryToEdit.description);
      setEditError(null);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editName.trim()) {
      setEditError('Category name is required.');
      return;
    }
    try {
      setEditLoading(true);
      setEditError(null);
      await api.updateCategory(token, editingCategory.id, {
        name: editName.trim(),
        description: editDescription.trim()
      });
      setEditingCategory(null);
      setEditName('');
      setEditDescription('');
      setEditError(null);
      fetchCategories();
    } catch (err: any) {
      console.error('Update category error:', err);
      setEditError(err.message || 'Failed to update category.');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Category States
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const startDeleteCategory = (id: number) => {
    const categoryToDelete = categories.find((c) => c.id === id);
    if (categoryToDelete) {
      setDeletingCategory(categoryToDelete);
      setDeleteError(null);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await api.deleteCategory(token, deletingCategory.id);
      setDeletingCategory(null);
      setDeleteError(null);
      fetchCategories();
    } catch (err: any) {
      console.error('Delete category error:', err);
      setDeleteError(err.message || 'Failed to delete category.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCategories(token, page, 10, 'id', 'asc');
      
      const fetchedContent = response?.data?.content || [];
      setCategories(fetchedContent);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err: any) {
      console.error('Fetch categories error:', err);
      setError(err.message || 'An unexpected error occurred while fetching categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token, page]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    });
  }, [categories, searchQuery]);

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return dateString;
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
              <Tag size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                Product Categories
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Manage product categorization and metadata details
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
            <span>Create Category</span>
          </button>

          <button
            onClick={fetchCategories}
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
            placeholder="Search by category name, description..."
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading platform categories...</p>
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
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f87171', marginBottom: '6px' }}>Failed to retrieve categories</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={fetchCategories}
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
      ) : filteredCategories.length === 0 ? (
        <div style={{
          background: 'rgba(15, 12, 30, 0.2)',
          border: '1px dashed var(--border-card)',
          borderRadius: '20px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <Tag size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>No categories found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto' }}>
            We couldn't find any categories matching your search query.
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category Details</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created At</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Updated</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => {
                  return (
                    <tr
                      key={category.id}
                      style={{
                        borderBottom: '1px solid var(--border-card)',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Name Details */}
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
                            <FolderOpen size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>
                              {category.name}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                              ID: #{category.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {category.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No description</span>}
                      </td>

                      {/* Created date */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'white' }}>
                          <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                          <span>{formatDate(category.createdAt)}</span>
                        </div>
                      </td>

                      {/* Updated date */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'white' }}>
                          <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                          <span>{new Date(category.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditCategory(category.id);
                            }}
                            title="Edit Category"
                            style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid var(--border-card)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: 'var(--primary-300)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'var(--transition-fast)'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startDeleteCategory(category.id);
                            }}
                            title="Delete Category"
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: '#fca5a5',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'var(--transition-fast)'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            }}
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
              Showing <strong>{filteredCategories.length}</strong> of <strong>{totalElements}</strong> categories
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
      {/* Create Category Modal Overlay */}
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
            maxWidth: '480px',
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
                <span>Create New Category</span>
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
            <form onSubmit={handleCreateCategory}>
              <div style={{ padding: '24px' }}>
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

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Category Name <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electronics, Home & Kitchen"
                    className="form-input"
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

                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Description
                  </label>
                  <textarea
                    placeholder="Provide a brief description of products in this category..."
                    className="form-input"
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
                  {createLoading ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Category Modal Overlay */}
      {editingCategory !== null && (
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
          setEditingCategory(null);
          setEditError(null);
        }}
        >
          <div style={{
            background: 'rgba(15, 12, 30, 0.95)',
            border: '1px solid var(--border-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '480px',
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
                <span>Edit Category Details</span>
              </h3>
              <button
                onClick={() => {
                  setEditingCategory(null);
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
            <form onSubmit={handleUpdateCategory}>
              <div style={{ padding: '24px' }}>
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

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Category Name <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electronics, Home & Kitchen"
                    className="form-input"
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

                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Description
                  </label>
                  <textarea
                    placeholder="Provide a brief description of products in this category..."
                    className="form-input"
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
                    setEditingCategory(null);
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
      {/* Delete Category Modal Overlay */}
      {deletingCategory !== null && (
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
          setDeletingCategory(null);
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
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-card)',
              background: 'rgba(255, 255, 255, 0.01)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
                <Trash2 size={18} />
                <span>Delete Category</span>
              </h3>
              <button
                onClick={() => {
                  setDeletingCategory(null);
                  setDeleteError(null);
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

            {/* Modal Body Content */}
            <div style={{ padding: '24px' }}>
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
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{deleteError}</span>
                </div>
              )}

              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                Are you sure you want to delete the category <strong style={{ color: 'white' }}>{deletingCategory.name}</strong>?
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#fca5a5' }}>
                Warning: This action is permanent and cannot be undone.
              </p>
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
                  setDeletingCategory(null);
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
                type="button"
                onClick={handleDeleteCategory}
                disabled={deleteLoading}
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
