import React, { useState } from 'react';
import { Mail, AlertCircle, ArrowLeft, Send, CheckCircle2, Copy, Check, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigateToLogin }) => {
  // Step 1 states (Forgot request)
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Token returned from API
  const [resetToken, setResetToken] = useState('');
  const [copied, setCopied] = useState(false);

  // Step 2 states (Reset form input)
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Email address is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!validateEmail()) return;

    setLoading(true);

    try {
      const response = await api.forgotPassword(email);
      const token = response?.data?.resetToken || '';
      
      if (!token) {
        throw new Error('No reset token returned from the server.');
      }

      setResetToken(token);
      setSuccessMsg(response?.message || 'A password reset request has been processed successfully.');
      setLoading(false);
    } catch (err: any) {
      console.error('Forgot Password API error:', err);
      if (err.message === 'Failed to fetch') {
        setError('Failed to connect to the server. Please check if the API backend is running.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tokenInput) {
      setError('Reset token is required');
      return;
    }
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setResetLoading(true);

    try {
      await api.resetPassword({ resetToken: tokenInput, newPassword });
      setResetSuccess(true);
      setResetLoading(false);
    } catch (err: any) {
      console.error('Reset Password API error:', err);
      if (err.message === 'Failed to fetch') {
        setError('Failed to connect to the server. Please check if the API backend is running.');
      } else {
        setError(err.message || 'An error occurred during password reset.');
      }
      setResetLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
          <Mail style={{ color: 'white', width: '28px', height: '28px' }} />
        </div>
        <h1 className="title">Reset Password</h1>
        <p className="subtitle">
          {resetSuccess 
            ? 'Success!' 
            : resetToken 
              ? 'Enter token and choose a new password' 
              : 'Enter your email to receive a reset token'
          }
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle style={{ flexShrink: 0, width: '18px', height: '18px' }} />
          <span>{error}</span>
        </div>
      )}

      {resetSuccess ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ color: '#10b981', display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <CheckCircle2 size={48} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'white' }}>Password Reset!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Your password has been reset successfully. You can now use your new credentials to sign in.
          </p>
          <button 
            type="button" 
            onClick={onNavigateToLogin} 
            className="btn-primary" 
            style={{ width: '100%', gap: '8px' }}
          >
            <ArrowLeft size={18} /> Back to Sign In
          </button>
        </div>
      ) : resetToken ? (
        <div>
          {/* Success Banner showing the Token */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <p style={{ fontSize: '13px', color: '#34d399', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
              <CheckCircle2 size={16} /> {successMsg || 'Reset Token Generated'}
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <code style={{
                flex: 1,
                padding: '10px 12px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                border: '1px solid var(--border-card)'
              }}>{resetToken}</code>
              <button
                type="button"
                onClick={copyToClipboard}
                style={{
                  background: 'var(--primary-600)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                title="Copy token"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Reset Password Form */}
          <form onSubmit={handleResetSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="token">Reset Token <span style={{ color: 'var(--error)' }}>*</span></label>
              <div className="form-input-wrapper">
                <Mail className="input-icon-start" size={18} />
                <input
                  id="token"
                  type="text"
                  placeholder="Paste reset token here"
                  className="form-input"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  disabled={resetLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New Password <span style={{ color: 'var(--error)' }}>*</span></label>
              <div className="form-input-wrapper">
                <Lock className="input-icon-start" size={18} />
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={resetLoading}
                  required
                />
                <button
                  type="button"
                  className="input-icon-end"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={resetLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm New Password <span style={{ color: 'var(--error)' }}>*</span></label>
              <div className="form-input-wrapper">
                <Lock className="input-icon-start" size={18} />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={resetLoading}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={resetLoading} style={{ width: '100%', marginTop: '8px', gap: '8px' }}>
              {resetLoading ? <span className="spinner" /> : 'Reset Password'}
            </button>

            <button 
              type="button" 
              onClick={() => setResetToken('')}
              style={{
                width: '100%',
                background: 'none',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '12px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'var(--transition-fast)'
              }}
              disabled={resetLoading}
            >
              Back
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleForgotSubmit} noValidate>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div className="label-container">
              <label className="form-label" htmlFor="email">Email Address <span style={{ color: 'var(--error)' }}>*</span></label>
            </div>
            <div className="form-input-wrapper">
              <Mail className="input-icon-start" size={18} />
              <input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginBottom: '16px', gap: '8px' }}>
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                Send Reset Link <Send size={16} />
              </>
            )}
          </button>

          <button 
            type="button" 
            onClick={onNavigateToLogin}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-card)',
              borderRadius: '12px',
              padding: '12px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
            disabled={loading}
          >
            <ArrowLeft size={16} /> Cancel
          </button>
        </form>
      )}
    </div>
  );
};
