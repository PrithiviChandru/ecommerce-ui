import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Copy, 
  Zap 
} from 'lucide-react';
import { api } from '../services/api';

interface LoginProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  onLoginSuccess: (email: string, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ 
  onNavigateToRegister, 
  onNavigateToForgotPassword, 
  onLoginSuccess 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWaking, setIsWaking] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

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

  const handleAutoFillDemo = () => {
    setEmail('user@example.com');
    setPassword('Password123');
    setError(null);
    setAutoFilled(true);
    setTimeout(() => {
      setAutoFilled(false);
    }, 2500);
  };

  const handleCopy = (text: string, field: 'email' | 'password', e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 1800);
  };

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
    <div className="login-split-wrapper">
      {/* LEFT COLUMN: 1-Ratio Companion Hub (Demo & System Warning Notes) */}
      <div className="login-companion-card">
        {/* Companion Header */}
        <div className="companion-header">
          <div className="companion-badge">
            <Sparkles size={14} />
            <span>Quick Access & Notice</span>
          </div>
          <h2 className="companion-title">Platform Hub</h2>
          <p className="companion-desc">Instant demo access and system environment notice</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="companion-demo-box">
          <div className="demo-box-header">
            <span className="demo-box-label">
              <Zap size={14} className="demo-zap-icon" /> Demo Account
            </span>
            <span className="demo-role-tag">Store Manager</span>
          </div>

          <div className="demo-credentials-list">
            <div 
              className="demo-credential-item" 
              onClick={() => { setEmail('user@example.com'); }}
              title="Click to insert email"
            >
              <div className="demo-cred-label">Email</div>
              <div className="demo-cred-value">
                <code>user@example.com</code>
                <button 
                  type="button" 
                  className="demo-copy-btn"
                  onClick={(e) => handleCopy('user@example.com', 'email', e)}
                  aria-label="Copy demo email"
                >
                  {copiedField === 'email' ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div 
              className="demo-credential-item" 
              onClick={() => { setPassword('Password123'); }}
              title="Click to insert password"
            >
              <div className="demo-cred-label">Password</div>
              <div className="demo-cred-value">
                <code>Password123</code>
                <button 
                  type="button" 
                  className="demo-copy-btn"
                  onClick={(e) => handleCopy('Password123', 'password', e)}
                  aria-label="Copy demo password"
                >
                  {copiedField === 'password' ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="button" 
            className={`btn-demo-autofill ${autoFilled ? 'autofill-active' : ''}`}
            onClick={handleAutoFillDemo}
          >
            {autoFilled ? (
              <>
                <Check size={16} /> Credentials Applied!
              </>
            ) : (
              <>
                <Sparkles size={16} /> Auto-Fill Demo Credentials
              </>
            )}
          </button>
        </div>

        {/* System Warning Notice Box */}
        <div className={`companion-warning-box ${isWaking ? 'warning-waking' : ''}`}>
          <div className="warning-box-header">
            <div className="warning-pill">
              <AlertCircle size={15} className="warning-icon" />
              <span>System Notice</span>
            </div>
            {isWaking ? (
              <span className="warning-badge-waking">Waking Up...</span>
            ) : (
              <span className="warning-badge-idle">Server Notice</span>
            )}
          </div>

          <p className="warning-note-text">
            The backend may take a few minutes to respond after a period of inactivity. Once active, the application will respond normally.
          </p>

          {isWaking && (
            <div className="waking-progress-indicator">
              <div className="waking-spinner" />
              <span>Waking up backend server...</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: 2-Ratio Primary Sign-In Card */}
      <div className="login-main-card">
        <div className="login-header">
          <div className="login-brand-icon">
            <Lock className="login-lock-svg" />
          </div>
          <div className="login-header-text">
            <h1 className="login-title">Sign In</h1>
            <p className="login-subtitle">Enter your credentials to access your store dashboard</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error login-alert">
            <AlertCircle style={{ flexShrink: 0, width: '18px', height: '18px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="login-form">
          <div className="form-group">
            <div className="label-container">
              <label className="form-label" htmlFor="email">
                Email Address <span style={{ color: 'var(--error)' }}>*</span>
              </label>
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
              <label className="form-label" htmlFor="password">
                Password <span style={{ color: 'var(--error)' }}>*</span>
              </label>
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

          <div className="flex-between login-options-row">
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
            <a 
              href="#forgot" 
              className="link" 
              onClick={(e) => { 
                e.preventDefault(); 
                onNavigateToForgotPassword(); 
              }}
            >
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

        <div className="login-footer-row">
          <span>Don't have an account?</span>
          <a 
            href="#register" 
            className="link login-signup-link" 
            onClick={(e) => { 
              e.preventDefault(); 
              onNavigateToRegister(); 
            }}
          >
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
};
