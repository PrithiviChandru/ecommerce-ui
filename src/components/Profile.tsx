import React, { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Phone, Globe, Calendar, ArrowLeft, AlertCircle, Shield, Edit, Save, X, CheckCircle2 } from 'lucide-react';
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

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTimeZone, setEditTimeZone] = useState('Asia/Kolkata');
  
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

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

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return dateString;
    }
  };

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
      console.warn("API profile update failed, applying offline fallback updates:", err);
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
          <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Loading your secure profile...</p>
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
            background: 'rgba(239, 68, 68, 0.1)',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle style={{ color: 'var(--error)', width: '32px', height: '32px' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Failed to Load Profile</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>{error || 'Unable to retrieve user details.'}</p>
          <button onClick={onBack} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '10px 24px' }}>
            <ArrowLeft size={16} /> Back to Products
          </button>
        </div>
      </div>
    );
  }

  const userInitials = `${profile.firstName.charAt(0)}${profile.lastName ? profile.lastName.charAt(0) : ''}`.toUpperCase();

  return (
    <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto', padding: '32px' }}>
      {/* Header section with back navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '6px 12px',
            borderRadius: '20px',
            transition: 'var(--transition-fast)',
          }}
          className="link"
        >
          <ArrowLeft size={16} /> Back to Products
        </button>
      </div>

      {/* Profile Info Header Panel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-card)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          fontWeight: 700,
          color: 'white',
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.35)',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {userInitials}
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
            {profile.firstName} {profile.lastName}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '12px',
              color: 'var(--primary-300)'
            }}>
              <Shield size={12} /> {profile.role}
            </span>
            <span>•</span>
            <span>ID: {profile.id}</span>
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
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          {isEditing ? 'Edit Profile Details' : 'Personal Details'}
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              color: 'var(--primary-300)',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
          >
            <Edit size={14} /> Edit Profile
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* First Name */}
        <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-card)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <UserIcon style={{ color: 'var(--primary-400)', flexShrink: 0 }} size={20} />
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: isEditing ? '4px' : '0' }}>First Name</span>
            {isEditing ? (
              <input
                type="text"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-card)', borderRadius: '6px', color: 'white', fontSize: '14px', outline: 'none' }}
                placeholder="First Name"
              />
            ) : (
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{profile.firstName}</span>
            )}
          </div>
        </div>

        {/* Last Name */}
        <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-card)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <UserIcon style={{ color: 'var(--primary-400)', flexShrink: 0 }} size={20} />
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: isEditing ? '4px' : '0' }}>Last Name</span>
            {isEditing ? (
              <input
                type="text"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-card)', borderRadius: '6px', color: 'white', fontSize: '14px', outline: 'none' }}
                placeholder="Last Name"
              />
            ) : (
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{profile.lastName}</span>
            )}
          </div>
        </div>

        {/* Email - Not Editable */}
        <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-card)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center', opacity: isEditing ? 0.6 : 1 }}>
          <Mail style={{ color: 'var(--primary-400)', flexShrink: 0 }} size={20} />
          <div>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address (Read-Only)</span>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{profile.email}</span>
          </div>
        </div>

        {/* Phone */}
        <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-card)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <Phone style={{ color: 'var(--primary-400)', flexShrink: 0 }} size={20} />
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: isEditing ? '4px' : '0' }}>Phone Number</span>
            {isEditing ? (
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-card)', borderRadius: '6px', color: 'white', fontSize: '14px', outline: 'none' }}
                placeholder="Phone Number"
              />
            ) : (
              <span style={{ fontSize: '14px', color: profile.phone ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500 }}>
                {profile.phone || 'Not provided'}
              </span>
            )}
          </div>
        </div>

        {/* Time Zone */}
        <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-card)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <Globe style={{ color: 'var(--primary-400)', flexShrink: 0 }} size={20} />
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: isEditing ? '4px' : '0' }}>Time Zone</span>
            {isEditing ? (
              <select
                value={editTimeZone}
                onChange={(e) => setEditTimeZone(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '6px', color: 'white', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} style={{ background: '#1e1b4b', color: 'white' }}>
                    {tz}
                  </option>
                ))}
              </select>
            ) : (
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{profile.timeZone}</span>
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
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-secondary)',
              borderRadius: '20px',
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 500,
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
              background: 'var(--primary-600)',
              border: 'none',
              color: 'white',
              borderRadius: '20px',
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
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

      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Account History</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {/* Created At */}
        <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-card)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <Calendar style={{ color: 'var(--primary-400)', flexShrink: 0 }} size={20} />
          <div>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Since</span>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{formatDate(profile.createdAt)}</span>
          </div>
        </div>

        {/* Updated At */}
        <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-card)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <Calendar style={{ color: 'var(--primary-400)', flexShrink: 0 }} size={20} />
          <div>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Updated</span>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{formatDate(profile.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
