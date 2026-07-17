import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { ForgotPassword } from './components/ForgotPassword';
import { api } from './services/api';

export const App: React.FC = () => {
  const [view, setView] = useState<'login' | 'register' | 'forgot-password' | 'dashboard'>('login');
  const [userEmail, setUserEmail] = useState('');
  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedEmail = localStorage.getItem('userEmail');
      if (storedToken && storedEmail) {
        try {
          setVerifying(true);
          await api.validateToken(storedToken);
          // Token is valid, restore session
          setUserEmail(storedEmail);
          setToken(storedToken);
          setView('dashboard');
        } catch (err) {
          console.error('Session verification failed:', err);
          handleLogout();
        } finally {
          setVerifying(false);
        }
      }
    };
    checkToken();
  }, []);

  const handleLoginSuccess = (email: string, userToken: string) => {
    setUserEmail(email);
    setToken(userToken);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('accessToken', userToken);
    setView('dashboard');
  };

  const handleRegisterSuccess = (email: string, userToken: string) => {
    setUserEmail(email);
    setToken(userToken);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('accessToken', userToken);
    setView('dashboard');
  };

  const handleLogout = async () => {
    const currentToken = token || localStorage.getItem('accessToken');
    if (currentToken) {
      try {
        await api.logout(currentToken);
      } catch (err) {
        console.error('Logout API failed:', err);
      }
    }
    setUserEmail('');
    setToken('');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setView('login');
  };

  if (verifying) {
    return (
      <main className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(139, 92, 246, 0.1)',
            borderTop: '3px solid var(--primary-500)',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Verifying session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: view === 'dashboard' ? 'flex-start' : 'center', justifyContent: 'center' }}>
      {view === 'login' && (
        <Login 
          onNavigateToRegister={() => setView('register')} 
          onNavigateToForgotPassword={() => setView('forgot-password')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {view === 'register' && (
        <Register 
          onNavigateToLogin={() => setView('login')} 
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
      {view === 'forgot-password' && (
        <ForgotPassword 
          onNavigateToLogin={() => setView('login')}
        />
      )}
      {view === 'dashboard' && (
        <Dashboard 
          userEmail={userEmail} 
          token={token}
          onLogout={handleLogout}
        />
      )}
    </main>
  );
};
