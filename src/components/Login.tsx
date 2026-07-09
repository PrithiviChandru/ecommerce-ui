import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);
    
    // Simulated mock authentication logic entirely inside the component
    setTimeout(() => {
      setLoading(false);
      if (email === 'admin@example.com' && password === 'admin123') {
        setSuccess('Login successful!');
        setTimeout(() => {
          onLoginSuccess(email);
        }, 800);
      } else if (email.endsWith('@example.com') && password.length >= 6) {
        setSuccess(`Welcome, ${email.split('@')[0].toUpperCase()}!`);
        setTimeout(() => {
          onLoginSuccess(email);
        }, 800);
      } else {
        setError('Invalid email or password. Hint: Use admin@example.com / admin123 or any @example.com email.');
      }
    }, 1200); // Simulate network delay
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
        <h1 className="title">Welcome Back</h1>
        <p className="subtitle">Sign in to your e-commerce dashboard</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle style={{ flexShrink: 0, width: '18px', height: '18px' }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 style={{ flexShrink: 0, width: '18px', height: '18px' }} />
          <span>{success}</span>
        </div>
      )}

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
              placeholder="name@example.com"
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
              placeholder="••••••••"
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
          <a href="#forgot" className="link" onClick={(e) => { e.preventDefault(); alert('Reset password flow is not implemented yet.'); }}>
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
        Email: <code style={{ color: 'var(--primary-300)' }}>admin@example.com</code><br />
        Password: <code style={{ color: 'var(--primary-300)' }}>admin123</code>
      </div>
    </div>
  );
};
