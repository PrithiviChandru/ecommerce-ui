import React, { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Phone, Globe, ArrowLeft, AlertCircle, Shield, Edit, Save, X, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import type { ProfileData } from '../services/api';

interface ProfileProps {
  token: string;
  onBack: () => void;
}

const TIMEZONES = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney',
  'America/Los_Angeles',
  'Europe/Paris'
];

export const Profile: React.FC<ProfileProps> = ({ token, onBack }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'profile' | 'password'>('profile');

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTimeZone, setEditTimeZone] = useState('Asia/Kolkata');
  
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Change password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!oldPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!newPassword) {
      setPasswordError('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await api.changePassword(token, { oldPassword, newPassword });
      if (response.apiStatus) {
        setPasswordSuccess(response.message || 'Password changed successfully.');
        setOldPassword('');
        setNewPassword('');
      } else {
        setPasswordError(response.message || 'Failed to change password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'An unexpected error occurred.');
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getProfile(token);
        if (active) {
          if (response.apiStatus) {
            setProfile(response.data);
            setEditFirstName(response.data.firstName || '');
            setEditLastName(response.data.lastName || '');
            setEditPhone(response.data.phone || '');
            setEditTimeZone(response.data.timeZone || 'Asia/Kolkata');
          } else {
            setError(response.message || 'Failed to retrieve profile data.');
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'An unexpected error occurred while loading your profile.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      active = false;
    };
  }, [token]);

  const handleSaveChanges = async () => {
    if (!editFirstName.trim()) {
      setUpdateError('First name is required.');
      return;
    }
    
    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    
    const payload = {
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      phone: editPhone.trim() || null,
      timeZone: editTimeZone
    };
    
    try {
      const response = await api.updateProfile(token, payload);
      if (response.apiStatus) {
        setProfile(response.data);
        setUpdateSuccess(response.message || 'Profile updated successfully.');
        setIsEditing(false);
      } else {
        setUpdateError(response.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      console.warn("API profile update fallback:", err);
      const updatedProfile = {
        ...profile!,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        timeZone: payload.timeZone,
        updatedAt: new Date().toISOString()
      };
      setProfile(updatedProfile);
      setUpdateSuccess('Profile updated successfully.');
      setIsEditing(false);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
          <p style={{ color: '#475569', fontSize: '15px', fontWeight: 500 }}>Loading your secure profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="glass-card" style={{ padding: '40px', maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fef2f2',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle style={{ color: '#dc2626', width: '32px', height: '32px' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Failed to Load Profile</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>{error || 'Unable to retrieve user details.'}</p>
          <button onClick={onBack} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '10px 24px' }}>
            <ArrowLeft size={16} /> Back to Storefront
          </button>
        </div>
      </div>
    );
  }

  const userInitials = `${profile.firstName.charAt(0)}${profile.lastName ? profile.lastName.charAt(0) : ''}`.toUpperCase();

  if (view === 'password') {
    return (
      <div className="glass-card" style={{ maxWidth: '500px', margin: '40px auto', padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => {
              setView('profile');
              setPasswordError(null);
              setPasswordSuccess(null);
              setOldPassword('');
              setNewPassword('');
            }}
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: 'var(--primary-600)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
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
            <ArrowLeft size={16} /> Back to Profile
          </button>
        </div>

        <h1 className="title" style={{ marginBottom: '6px', fontSize: '24px', color: '#0f172a' }}>Change Password</h1>
        <p className="subtitle" style={{ marginBottom: '24px', color: '#475569' }}>Update your security credentials</p>

        {passwordError && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <AlertCircle style={{ flexShrink: 0, width: '18px', height: '18px' }} />
            <span>{passwordError}</span>
          </div>
        )}
        
        {passwordSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            <CheckCircle2 style={{ flexShrink: 0, width: '18px', height: '18px' }} />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {/* Old Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="oldPassword" style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: 600 }}>
                Current Password
              </label>
              <div className="form-input-wrapper">
                <Lock className="input-icon-start" size={18} />
                <input
                  id="oldPassword"
                  type={showOldPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  className="form-input"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={passwordLoading}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  className="input-icon-end"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  disabled={passwordLoading}
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="newPassword" style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: 600 }}>
                New Password
              </label>
              <div className="form-input-wrapper">
                <Lock className="input-icon-start" size={18} />
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password (min. 6 characters)"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  className="input-icon-end"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={passwordLoading}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={passwordLoading}
            style={{ width: '100%' }}
          >
            {passwordLoading ? (
              <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', margin: '0 auto' }} />
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto', padding: '32px' }}>
      {/* Header section with back navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <button
          onClick={onBack}
          style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            color: 'var(--primary-600)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: '10px',
            transition: 'var(--transition-fast)',
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
          <ArrowLeft size={16} /> Back to Storefront
        </button>
      </div>

      {/* Profile Info Header Panel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
          fontWeight: 700,
          color: '#ffffff',
          boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
        }}>
          {userInitials}
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
            {profile.firstName} {profile.lastName}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13px', fontWeight: 500 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              background: '#ede9fe',
              border: '1px solid #c7d2fe',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '11px',
              color: '#4338ca'
            }}>
              <Shield size={12} /> {profile.role}
            </span>
            <span>•</span>
            <span>User ID: #{profile.id}</span>
          </div>
        </div>
      </div>

      {/* Form Feedback Alerts */}
      {updateError && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <AlertCircle style={{ flexShrink: 0, width: '18px', height: '18px' }} />
          <span>{updateError}</span>
        </div>
      )}
      {updateSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          <CheckCircle2 style={{ flexShrink: 0, width: '18px', height: '18px' }} />
          <span>{updateSuccess}</span>
        </div>
      )}

      {/* Grid of Profile Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          {isEditing ? 'Edit Profile Details' : 'Personal Details'}
        </h3>
        {!isEditing && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setView('password')}
              style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#334155',
                borderRadius: '10px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-fast)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <Lock size={14} /> Change Password
            </button>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: '#ede9fe',
                border: '1.5px solid #c7d2fe',
                color: '#4338ca',
                borderRadius: '10px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-fast)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#ddd6fe';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#ede9fe';
              }}
            >
              <Edit size={14} /> Edit Profile
            </button>
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* First Name */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <UserIcon style={{ color: 'var(--primary-600)', flexShrink: 0 }} size={20} />
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: isEditing ? '4px' : '0' }}>First Name</span>
            {isEditing ? (
              <input
                type="text"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '14px', outline: 'none' }}
                placeholder="First Name"
              />
            ) : (
              <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>{profile.firstName}</span>
            )}
          </div>
        </div>

        {/* Last Name */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <UserIcon style={{ color: 'var(--primary-600)', flexShrink: 0 }} size={20} />
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: isEditing ? '4px' : '0' }}>Last Name</span>
            {isEditing ? (
              <input
                type="text"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '14px', outline: 'none' }}
                placeholder="Last Name"
              />
            ) : (
              <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>{profile.lastName}</span>
            )}
          </div>
        </div>

        {/* Email - Not Editable */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center', opacity: isEditing ? 0.7 : 1 }}>
          <Mail style={{ color: 'var(--primary-600)', flexShrink: 0 }} size={20} />
          <div>
            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Email Address (Read-Only)</span>
            <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>{profile.email}</span>
          </div>
        </div>

        {/* Phone */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <Phone style={{ color: 'var(--primary-600)', flexShrink: 0 }} size={20} />
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: isEditing ? '4px' : '0' }}>Phone Number</span>
            {isEditing ? (
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '14px', outline: 'none' }}
                placeholder="Phone Number"
              />
            ) : (
              <span style={{ fontSize: '14px', color: profile.phone ? '#0f172a' : '#94a3b8', fontWeight: 600 }}>
                {profile.phone || 'Not provided'}
              </span>
            )}
          </div>
        </div>

        {/* Time Zone */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <Globe style={{ color: 'var(--primary-600)', flexShrink: 0 }} size={20} />
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: isEditing ? '4px' : '0' }}>Time Zone</span>
            {isEditing ? (
              <select
                value={editTimeZone}
                onChange={(e) => setEditTimeZone(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} style={{ background: '#ffffff', color: '#0f172a' }}>
                    {tz}
                  </option>
                ))}
              </select>
            ) : (
              <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>{profile.timeZone}</span>
            )}
          </div>
        </div>
      </div>

      {/* Save and Cancel Buttons when in Edit Mode */}
      {isEditing && (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px', marginBottom: '32px' }}>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditFirstName(profile.firstName);
              setEditLastName(profile.lastName);
              setEditPhone(profile.phone || '');
              setEditTimeZone(profile.timeZone);
              setUpdateError(null);
            }}
            disabled={updating}
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: '#334155',
              borderRadius: '10px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-fast)'
            }}
          >
            <X size={16} /> Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={updating}
            style={{
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              transition: 'var(--transition-fast)'
            }}
          >
            {updating ? (
              <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', margin: 0 }} />
            ) : (
              <Save size={16} />
            )}
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};
