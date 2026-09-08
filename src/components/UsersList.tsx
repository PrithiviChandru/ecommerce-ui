import React, { useEffect, useState, useMemo } from 'react';
import { Users, Search, Shield, Mail, Calendar, Clock, AlertCircle, Phone, Globe, RefreshCw, X, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import type { UserListItem } from '../services/api';

interface UsersListProps {
  token: string;
  onBack: () => void;
}

export const UsersList: React.FC<UsersListProps> = ({ token, onBack }) => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'All' | 'ADMIN' | 'USER'>('All');

  // Detail Modal States
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [detailedUser, setDetailedUser] = useState<UserListItem | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Deletion States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteUser = async (id: number) => {
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      const response = await api.deleteUser(token, id);
      if (response.apiStatus && response.data.success) {
        setSelectedUserId(null);
        setShowDeleteConfirm(false);
        fetchUsers();
      } else {
        setDeleteError(response.message || response.data.message || 'Failed to delete user.');
      }
    } catch (err: any) {
      console.error('Delete user error:', err);
      setDeleteError(err.message || 'An unexpected error occurred during deletion.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedUserId(null);
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (selectedUserId === null) {
        setDetailedUser(null);
        return;
      }
      try {
        setDetailsLoading(true);
        setDetailsError(null);
        const response = await api.getUserById(token, selectedUserId);
        if (response.apiStatus) {
          setDetailedUser(response.data);
        } else {
          setDetailsError(response.message || 'Failed to fetch user details.');
        }
      } catch (err: any) {
        console.error('Fetch user details error:', err);
        setDetailsError(err.message || 'An unexpected error occurred.');
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchUserDetails();
  }, [selectedUserId, token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getUsers(token);
      if (response.apiStatus) {
        setUsers(response.data || []);
      } else {
        setError(response.message || 'Failed to retrieve users list.');
      }
    } catch (err: any) {
      console.error('Fetch users error:', err);
      setError(err.message || 'An unexpected error occurred while fetching users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = selectedRole === 'All' || u.role === selectedRole;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        u.firstName.toLowerCase().includes(searchLower) ||
        u.lastName.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        (u.phone && u.phone.includes(searchLower)) ||
        u.timeZone.toLowerCase().includes(searchLower);
      return matchesRole && matchesSearch;
    });
  }, [users, searchQuery, selectedRole]);

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
              <Users size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                User Accounts
              </h2>
              <p style={{ fontSize: '13px', color: '#475569', margin: '2px 0 0 0' }}>
                Manage and view registered user accounts on the platform
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchUsers}
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
            placeholder="Search by name, email, timezone..."
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

        {/* Role Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['All', 'ADMIN', 'USER'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              style={{
                background: selectedRole === role ? 'var(--primary-600)' : '#ffffff',
                border: selectedRole === role ? '1px solid var(--primary-600)' : '1.5px solid #cbd5e1',
                color: selectedRole === role ? '#ffffff' : '#334155',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                boxShadow: selectedRole === role ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none'
              }}
            >
              {role}
            </button>
          ))}
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
          <p style={{ color: '#475569', fontSize: '14px', fontWeight: 500 }}>Loading platform users...</p>
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
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>Failed to retrieve users</h3>
          <p style={{ fontSize: '13px', color: '#b91c1c', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={fetchUsers}
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
      ) : filteredUsers.length === 0 ? (
        <div style={{
          background: '#ffffff',
          border: '2px dashed #cbd5e1',
          borderRadius: '20px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <Users size={36} style={{ color: '#94a3b8', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>No users found</h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '320px', margin: '0 auto' }}>
            We couldn't find any users matching your filter or search query.
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Details</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone / Timezone</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
                  const isAdmin = user.role === 'ADMIN';

                  return (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* User Info (Avatar + Name + Email) */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: isAdmin ? 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)' : '#ede9fe',
                            border: isAdmin ? 'none' : '1px solid #c7d2fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 700,
                            color: isAdmin ? '#ffffff' : 'var(--primary-600)',
                            boxShadow: isAdmin ? '0 4px 10px rgba(79, 70, 229, 0.25)' : 'none'
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px', marginTop: '2px', fontWeight: 500 }}>
                              <Mail size={12} />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: isAdmin ? '#ede9fe' : '#f1f5f9',
                          border: isAdmin ? '1px solid #c7d2fe' : '1px solid #cbd5e1',
                          color: isAdmin ? '#4338ca' : '#334155'
                        }}>
                          <Shield size={10} />
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* Phone & timezone */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
                          {user.phone ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={12} style={{ color: '#64748b' }} />
                              <span>{user.phone}</span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px', fontWeight: 400 }}>No phone</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '12px', marginTop: '4px' }}>
                          <Globe size={12} style={{ color: '#64748b' }} />
                          <span>{user.timeZone}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        {!isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUserId(user.id);
                              setShowDeleteConfirm(true);
                            }}
                            title="Delete User"
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
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#475569' }}>
              Total: <strong>{filteredUsers.length}</strong> user accounts shown
            </span>
          </div>
        </div>
      )}

      {/* User Details Modal Overlay */}
      {selectedUserId !== null && (
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
        onClick={closeModal}
        >
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
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
                <Users size={18} style={{ color: 'var(--primary-600)' }} />
                <span>User Account Details</span>
              </h3>
              <button
                onClick={closeModal}
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

            {/* Modal Body */}
            <div style={{ padding: '28px 24px' }}>
              {showDeleteConfirm ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#dc2626',
                    margin: '0 auto 20px'
                  }}>
                    <Trash2 size={24} />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Delete User Account?</h4>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5', maxWidth: '340px', margin: '0 auto 24px' }}>
                    Are you sure you want to delete <strong style={{ color: '#0f172a' }}>{detailedUser?.firstName} {detailedUser?.lastName}</strong>? This action cannot be undone and will permanently remove their access.
                  </p>
                  
                  {deleteError && (
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#dc2626',
                      fontSize: '13px',
                      fontWeight: 500,
                      marginBottom: '20px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{deleteError}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteError(null);
                      }}
                      disabled={deleteLoading}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        color: '#334155',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => detailedUser && handleDeleteUser(detailedUser.id)}
                      disabled={deleteLoading}
                      style={{
                        background: '#dc2626',
                        border: 'none',
                        color: '#ffffff',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {deleteLoading ? 'Deleting...' : 'Yes, Delete User'}
                    </button>
                  </div>
                </div>
              ) : detailsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="spin-animation" style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #ede9fe',
                    borderTop: '3px solid var(--primary-600)',
                    borderRadius: '50%',
                    margin: '0 auto 16px'
                  }} />
                  <p style={{ color: '#475569', fontSize: '14px', fontWeight: 500 }}>Fetching details from platform...</p>
                </div>
              ) : detailsError ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <AlertCircle size={36} style={{ color: '#dc2626', marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', color: '#dc2626', margin: 0, fontWeight: 500 }}>{detailsError}</p>
                </div>
              ) : detailedUser ? (
                <div>
                  {/* Large Avatar Initials & Header Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px', textAlign: 'center' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: detailedUser.role === 'ADMIN' ? 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)' : '#ede9fe',
                      border: detailedUser.role === 'ADMIN' ? 'none' : '2px solid #c7d2fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      fontWeight: 700,
                      color: detailedUser.role === 'ADMIN' ? '#ffffff' : 'var(--primary-600)',
                      boxShadow: detailedUser.role === 'ADMIN' ? '0 10px 25px rgba(79, 70, 229, 0.25)' : 'none',
                      marginBottom: '16px'
                    }}>
                      {`${detailedUser.firstName?.[0] || ''}${detailedUser.lastName?.[0] || ''}`.toUpperCase() || 'U'}
                    </div>
                    <h4 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px 0', color: '#0f172a' }}>
                      {detailedUser.firstName} {detailedUser.lastName}
                    </h4>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: detailedUser.role === 'ADMIN' ? '#ede9fe' : '#f1f5f9',
                      border: detailedUser.role === 'ADMIN' ? '1px solid #c7d2fe' : '1px solid #cbd5e1',
                      color: detailedUser.role === 'ADMIN' ? '#4338ca' : '#334155'
                    }}>
                      <Shield size={10} />
                      <span>{detailedUser.role}</span>
                    </span>
                  </div>

                  {/* Metadata Fields Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                    {/* User ID */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>User ID</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>#{detailedUser.id}</span>
                    </div>

                    {/* Email */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Email Address</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} style={{ color: '#64748b' }} />
                        {detailedUser.email}
                      </span>
                    </div>

                    {/* Phone */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Phone Number</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {detailedUser.phone ? (
                          <>
                            <Phone size={12} style={{ color: '#64748b' }} />
                            {detailedUser.phone}
                          </>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>Not Provided</span>
                        )}
                      </span>
                    </div>

                    {/* Timezone */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Time Zone</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={12} style={{ color: '#64748b' }} />
                        {detailedUser.timeZone}
                      </span>
                    </div>

                    {/* Created Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Created On</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={12} style={{ color: '#64748b' }} />
                        {formatDate(detailedUser.createdAt)}
                      </span>
                    </div>

                    {/* Updated Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Last Updated</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} style={{ color: '#64748b' }} />
                        {new Date(detailedUser.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeModal}
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
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
