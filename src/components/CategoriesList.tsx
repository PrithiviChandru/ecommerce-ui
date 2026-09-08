import React, { useEffect, useState, useMemo } from 'react';
import { Tag, Search, FolderOpen, RefreshCw, AlertCircle, X, Plus, Edit2, Trash2 } from 'lucide-react';
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

  return (
    <div style={{ width: '100%', animation: 'fade-in 0.4s ease-out' }}>
      {/* Header section with back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button
            onClick={onBack}
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: 'var(--primary-600)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              padding: '6px 14px',
              borderRadius: '10px',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = 'var(--primary-500)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            ← Back to Storefront
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ede9fe',
              border: '1px solid #c7d2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-600)'
            }}>
              <Tag size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                Product Categories
              </h2>
              <p style={{ fontSize: '13px', color: '#475569', margin: '2px 0 0 0' }}>
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
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <Plus size={15} />
            <span>Create Category</span>
          </button>

          <button
            onClick={fetchCategories}
            disabled={loading}
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: '#1e293b',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = 'var(--primary-500)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search by category name, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '24px',
              padding: '10px 16px 10px 42px',
              fontSize: '14px',
              color: '#0f172a',
              outline: 'none',
              transition: 'var(--transition-smooth)'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-600)'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
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
                color: '#64748b',
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
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '48px 24px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div className="spin-animation" style={{
            width: '32px',
            height: '32px',
            border: '3px solid #ede9fe',
            borderTop: '3px solid var(--primary-600)',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#475569', fontSize: '14px', fontWeight: 500 }}>Loading platform categories...</p>
        </div>
      ) : error ? (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '20px',
          padding: '32px 24px',
          textAlign: 'center',
          maxWidth: '480px',
          margin: '0 auto'
        }}>
          <AlertCircle size={36} style={{ color: '#dc2626', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>Failed to retrieve categories</h3>
          <p style={{ fontSize: '13px', color: '#b91c1c', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={fetchCategories}
            style={{
              background: 'var(--primary-600)',
              border: 'none',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div style={{
          background: '#ffffff',
          border: '2px dashed #cbd5e1',
          borderRadius: '20px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <Tag size={36} style={{ color: '#94a3b8', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>No categories found</h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '320px', margin: '0 auto' }}>
            We couldn't find any categories matching your search query.
          </p>
        </div>
      ) : (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category Details</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => {
                  return (
                    <tr
                      key={category.id}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Name Details */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: '#ede9fe',
                            border: '1px solid #c7d2fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--primary-600)'
                          }}>
                            <FolderOpen size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                              {category.name}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px', fontWeight: 500 }}>
                              ID: #{category.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {category.description || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No description</span>}
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
                              background: '#f8fafc',
                              border: '1.5px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: 'var(--primary-600)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'var(--transition-fast)'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#ede9fe';
                              e.currentTarget.style.borderColor = '#818cf8';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.borderColor = '#cbd5e1';
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
                              background: '#fef2f2',
                              border: '1.5px solid #fecaca',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: '#dc2626',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'var(--transition-fast)'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#fee2e2';
                              e.currentTarget.style.borderColor = '#f87171';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = '#fef2f2';
                              e.currentTarget.style.borderColor = '#fecaca';
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
          <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#475569' }}>
              Showing <strong>{filteredCategories.length}</strong> of <strong>{totalElements}</strong> categories
            </span>
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: page === 0 ? '#94a3b8' : '#1e293b',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: page === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: page >= totalPages - 1 ? '#94a3b8' : '#1e293b',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
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
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
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
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: 'var(--primary-600)' }} />
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
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#e2e8f0';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#64748b';
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
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#dc2626',
                    fontSize: '13px',
                    fontWeight: 500,
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
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    Category Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electronics, Home & Kitchen"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    disabled={createLoading}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: '#0f172a',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    Description
                  </label>
                  <textarea
                    placeholder="Provide a brief description of products in this category..."
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    disabled={createLoading}
                    rows={4}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: '#0f172a',
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
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
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
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#334155',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
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
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
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
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} style={{ color: 'var(--primary-600)' }} />
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
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#e2e8f0';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#64748b';
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
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#dc2626',
                    fontSize: '13px',
                    fontWeight: 500,
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
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    Category Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electronics, Home & Kitchen"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={editLoading}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: '#0f172a',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    Description
                  </label>
                  <textarea
                    placeholder="Provide a brief description of products in this category..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    disabled={editLoading}
                    rows={4}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: '#0f172a',
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
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
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
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#334155',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
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
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
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
            background: '#ffffff',
            border: '1px solid #fecaca',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
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
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#e2e8f0';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Content */}
            <div style={{ padding: '24px' }}>
              {deleteError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#dc2626',
                  fontSize: '13px',
                  fontWeight: 500,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{deleteError}</span>
                </div>
              )}

              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#475569' }}>
                Are you sure you want to delete the category <strong style={{ color: '#0f172a' }}>{deletingCategory.name}</strong>?
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: 500 }}>
                Warning: This action is permanent and cannot be undone.
              </p>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
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
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  color: '#334155',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
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
                  background: '#dc2626',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
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
