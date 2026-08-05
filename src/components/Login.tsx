import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface LoginProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  onLoginSuccess: (email: string, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToRegister, onNavigateToForgotPassword, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => {
    let active = true;
    const wakeUpServer = async () => {
      const timeoutId = setTimeout(() => {
        if (active) {
          setIsWaking(true);
        }
      }, 1200);

      try {
        await api.wakeUp();
        clearTimeout(timeoutId);
        if (active) {
          setIsWaking(false);
        }
      } catch (err) {
        console.warn('Wake up ping finished:', err);
        clearTimeout(timeoutId);
        if (active) {
          setIsWaking(false);
        }
      }
    };

    wakeUpServer();
    return () => {
      active = false;
    };
  }, []);

  // Simple client-side validation
  const validateForm = (): boolean => {
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
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const response = await api.login(email, password);
      setTimeout(() => {
        const userEmail = response.data?.userInfo?.email || response.data?.user?.email || (response as any).email || email;
        const accessToken = response.data?.accessToken || response.data?.token || '';
        const refreshToken = response.data?.refreshToken || '';
        
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        onLoginSuccess(userEmail, accessToken);
      }, 800);
    } catch (err: any) {
      console.error('Login API error:', err);
      if (err.message === 'Failed to fetch') {
        setError('Failed to connect to the server. Please check if the API backend is running, CORS is enabled, and your internet connection is active.');
      } else {
        setError(err.message || 'Invalid email or password.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        {/* Nice branding logo container */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)'
        }}>
          <Lock style={{ color: 'white', width: '28px', height: '28px' }} />
        </div>
        <h1 className="title">Welcome</h1>
        <p className="subtitle">Sign in to your e-commerce dashboard</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle style={{ flexShrink: 0, width: '18px', height: '18px' }} />
          <span>{error}</span>
        </div>
      )}

      {/* Render Tier Warning Note */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.06)',
        border: '1px solid rgba(245, 158, 11, 0.15)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <AlertCircle size={18} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', color: '#f59e0b', lineHeight: '1.5', width: '100%' }}>
          <strong style={{ display: 'block', marginBottom: '2px', color: '#fbbf24' }}>System Notice</strong>
          <span>The backend API is hosted on a free instance. If it was idle, it may take <strong>10 to 15 minutes</strong> to spin up and respond. Thank you for your patience!</span>
          {isWaking && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
              background: 'rgba(245, 158, 11, 0.1)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px dashed rgba(245, 158, 11, 0.3)',
              width: 'fit-content'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                border: '2px solid rgba(251, 191, 36, 0.2)',
                borderTop: '2px solid #fbbf24',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ fontWeight: 600, color: '#fbbf24', fontSize: '11px' }}>Waking up backend server...</span>
            </div>
          )}
        </div>
      </div>


      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <div className="label-container">
            <label className="form-label" htmlFor="email">Email Address <span style={{ color: 'var(--error)' }}>*</span></label>
          </div>
          <div className="form-input-wrapper">
            <Mail className="input-icon-start" size={18} />
            <input
              id="email"
              type="email"
              placeholder="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="label-container">
            <label className="form-label" htmlFor="password">Password <span style={{ color: 'var(--error)' }}>*</span></label>
          </div>
          <div className="form-input-wrapper">
            <Lock className="input-icon-start" size={18} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
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

        <div className="flex-between">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <span className="custom-checkbox"></span>
            <span>Remember me</span>
          </label>
          <a href="#forgot" className="link" onClick={(e) => { e.preventDefault(); onNavigateToForgotPassword(); }}>
            Forgot password?
          </a>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              Sign In <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="footer-text">
        Don't have an account?{' '}
        <a href="#register" className="link" onClick={(e) => { e.preventDefault(); onNavigateToRegister(); }}>
          Sign up
        </a>
      </div>

      {/* Helpful Hint banner for the user */}
      <div style={{
        marginTop: '28px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px dashed var(--border-card)',
        borderRadius: '12px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        lineHeight: '1.5'
      }}>
        <strong>Demo Credentials:</strong><br />
        Email: <code style={{ color: 'var(--primary-300)' }}>user@example.com</code><br />
        Password: <code style={{ color: 'var(--primary-300)' }}>Password123</code>
      </div>
    </div>
  );
};
