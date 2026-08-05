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
              <Users size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                User Accounts
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Manage and view registered user accounts on the platform
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchUsers}
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
            placeholder="Search by name, email, timezone..."
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

        {/* Role Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['All', 'ADMIN', 'USER'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              style={{
                background: selectedRole === role ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.02)',
                border: '1px solid',
                borderColor: selectedRole === role ? 'var(--primary-500)' : 'var(--border-card)',
                color: selectedRole === role ? 'white' : 'var(--text-secondary)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading platform users...</p>
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
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f87171', marginBottom: '6px' }}>Failed to retrieve users</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={fetchUsers}
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
      ) : filteredUsers.length === 0 ? (
        <div style={{
          background: 'rgba(15, 12, 30, 0.2)',
          border: '1px dashed var(--border-card)',
          borderRadius: '20px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <Users size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>No users found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto' }}>
            We couldn't find any users matching your filter or search query.
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Details</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone / Timezone</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created At</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
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
                        borderBottom: '1px solid var(--border-card)',
                        transition: 'background 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* User Info (Avatar + Name + Email) */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: isAdmin ? 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)' : 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'white',
                            boxShadow: isAdmin ? '0 4px 10px rgba(139, 92, 246, 0.2)' : 'none'
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
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
                          background: isAdmin ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          border: isAdmin ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: isAdmin ? 'var(--primary-300)' : 'var(--text-secondary)'
                        }}>
                          <Shield size={10} />
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* Phone & timezone */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '13px', color: 'white' }}>
                          {user.phone ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                              <span>{user.phone}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px' }}>No phone</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                          <Globe size={12} style={{ color: 'var(--text-muted)' }} />
                          <span>{user.timeZone}</span>
                        </div>
                      </td>

                      {/* Created date */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'white' }}>
                          <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                          <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                          <span>{new Date(user.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
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
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '16px 24px', background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
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
          background: 'rgba(3, 0, 20, 0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fade-in 0.25s ease-out'
        }}
        onClick={closeModal}
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
                <Users size={18} style={{ color: 'var(--primary-400)' }} />
                <span>User Account Details</span>
              </h3>
              <button
                onClick={closeModal}
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

            {/* Modal Body */}
            <div style={{ padding: '28px 24px' }}>
              {showDeleteConfirm ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                    margin: '0 auto 20px'
                  }}>
                    <Trash2 size={24} />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Delete User Account?</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '340px', margin: '0 auto 24px' }}>
                    Are you sure you want to delete <strong>{detailedUser?.firstName} {detailedUser?.lastName}</strong>? This action cannot be undone and will permanently remove their access.
                  </p>
                  
                  {deleteError && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#f87171',
                      fontSize: '13px',
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
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-card)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => detailedUser && handleDeleteUser(detailedUser.id)}
                      disabled={deleteLoading}
                      style={{
                        background: '#ef4444',
                        border: 'none',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 500,
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
                    border: '3px solid rgba(139, 92, 246, 0.1)',
                    borderTop: '3px solid var(--primary-500)',
                    borderRadius: '50%',
                    margin: '0 auto 16px'
                  }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Fetching details from platform...</p>
                </div>
              ) : detailsError ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <AlertCircle size={36} style={{ color: 'var(--error)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', color: '#f87171', margin: 0 }}>{detailsError}</p>
                </div>
              ) : detailedUser ? (
                <div>
                  {/* Large Avatar Initials & Header Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px', textAlign: 'center' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: detailedUser.role === 'ADMIN' ? 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)' : 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      fontWeight: 700,
                      color: 'white',
                      boxShadow: detailedUser.role === 'ADMIN' ? '0 10px 25px rgba(139, 92, 246, 0.3)' : 'none',
                      marginBottom: '16px'
                    }}>
                      {`${detailedUser.firstName?.[0] || ''}${detailedUser.lastName?.[0] || ''}`.toUpperCase() || 'U'}
                    </div>
                    <h4 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px 0', color: 'white' }}>
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
                      background: detailedUser.role === 'ADMIN' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: detailedUser.role === 'ADMIN' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: detailedUser.role === 'ADMIN' ? 'var(--primary-300)' : 'var(--text-secondary)'
                    }}>
                      <Shield size={10} />
                      <span>{detailedUser.role}</span>
                    </span>
                  </div>

                  {/* Metadata Fields Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-card)', borderRadius: '16px', padding: '20px' }}>
                    {/* User ID */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>User ID</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>#{detailedUser.id}</span>
                    </div>

                    {/* Email */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Email Address</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                        {detailedUser.email}
                      </span>
                    </div>

                    {/* Phone */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Phone Number</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {detailedUser.phone ? (
                          <>
                            <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                            {detailedUser.phone}
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px' }}>Not Provided</span>
                        )}
                      </span>
                    </div>

                    {/* Timezone */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Time Zone</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={12} style={{ color: 'var(--text-muted)' }} />
                        {detailedUser.timeZone}
                      </span>
                    </div>

                    {/* Created Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Created On</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                        {formatDate(detailedUser.createdAt)}
                      </span>
                    </div>

                    {/* Updated Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Last Updated</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
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
              borderTop: '1px solid var(--border-card)',
              background: 'rgba(255, 255, 255, 0.01)',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeModal}
                className="btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '13px',
                  borderRadius: '10px'
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
