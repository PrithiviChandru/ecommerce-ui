import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Phone, Globe, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface RegisterProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: (email: string) => void;
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

export const Register: React.FC<RegisterProps> = ({ onNavigateToLogin, onRegisterSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [registeredData, setRegisteredData] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!email) {
      setError('Email address is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!timeZone) {
      setError('Time zone is required');
      return false;
    }
    
    // Phone number is optional. If provided, validate formatting.
    const cleanPhone = phone.replace(/[\s-()]/g, '');
    if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setRegisteredData(null);

    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      email: email.trim(),
      password,
      phone: phone.replace(/[\s-()]/g, '') || undefined,
      timeZone
    };

    setTimeout(() => {
      setLoading(false);
      setSuccess('Registration successful!');
      setRegisteredData(JSON.stringify(payload, null, 2));
    }, 1200);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '540px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          type="button"
          onClick={onNavigateToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '16px',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'var(--transition-fast)'
          }}
          className="link"
        >
          <ArrowLeft size={16} /> Back to Login
        </button>
        <h1 className="title">Create Account</h1>
        <p className="subtitle">Join our premium e-commerce dashboard</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle style={{ flexShrink: 0, width: '18px', height: '18px' }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 style={{ flexShrink: 0, width: '18px', height: '18px' }} />
            <span>{success}</span>
          </div>
          {registeredData && (
            <div style={{ width: '100%', marginTop: '8px' }}>
              <p style={{ fontSize: '12px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Generated Registration JSON Payload:</p>
              <pre style={{
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                overflowX: 'auto',
                color: '#a7f3d0',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontFamily: 'monospace',
                marginBottom: '12px'
              }}>
                {registeredData}
              </pre>
              <button
                type="button"
                className="btn-primary"
                onClick={() => onRegisterSuccess(email)}
                style={{
                  padding: '10px 16px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                  border: 'none',
                  boxShadow: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  width: 'auto',
                  display: 'inline-flex',
                  marginTop: '4px'
                }}
              >
                Proceed to Dashboard
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="firstName" style={{ display: 'block', marginBottom: '8px' }}>First Name <span style={{ color: 'var(--error)' }}>*</span></label>
            <div className="form-input-wrapper">
              <User className="input-icon-start" size={18} />
              <input
                id="firstName"
                type="text"
                placeholder="John"
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '44px', paddingRight: '16px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="lastName" style={{ display: 'block', marginBottom: '8px' }}>Last Name <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>(Optional)</span></label>
            <div className="form-input-wrapper">
              <User className="input-icon-start" size={18} />
              <input
                id="lastName"
                type="text"
                placeholder="Michel"
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '44px', paddingRight: '16px' }}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email" style={{ display: 'block', marginBottom: '8px' }}>Email Address <span style={{ color: 'var(--error)' }}>*</span></label>
          <div className="form-input-wrapper">
            <Mail className="input-icon-start" size={18} />
            <input
              id="email"
              type="email"
              placeholder="user@example.com"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password" style={{ display: 'block', marginBottom: '8px' }}>Password <span style={{ color: 'var(--error)' }}>*</span></label>
          <div className="form-input-wrapper">
            <Lock className="input-icon-start" size={18} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="input-icon-end"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phone" style={{ display: 'block', marginBottom: '8px' }}>Phone Number <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>(Optional)</span></label>
          <div className="form-input-wrapper">
            <Phone className="input-icon-start" size={18} />
            <input
              id="phone"
              type="tel"
              placeholder="9876543210"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="timeZone" style={{ display: 'block', marginBottom: '8px' }}>Time Zone <span style={{ color: 'var(--error)' }}>*</span></label>
          <div className="form-input-wrapper">
            <Globe className="input-icon-start" size={18} />
            <select
              id="timeZone"
              className="form-input"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              disabled={loading}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                cursor: 'pointer',
                paddingRight: '40px'
              }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz} style={{ background: '#030014', color: 'var(--text-primary)' }}>
                  {tz}
                </option>
              ))}
            </select>
            <div style={{
              position: 'absolute',
              right: '18px',
              pointerEvents: 'none',
              borderTop: '5px solid var(--text-secondary)',
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
            }} />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? (
            <span className="spinner" />
          ) : (
            'Register Account'
          )}
        </button>
      </form>

      <div className="footer-text">
        Already have an account?{' '}
        <a href="#login" className="link" onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }}>
          Sign in
        </a>
      </div>
    </div>
  );
};
