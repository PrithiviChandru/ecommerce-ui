import React, { useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';

export const App: React.FC = () => {
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [userEmail, setUserEmail] = useState('');

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setView('dashboard');
  };

  const handleRegisterSuccess = (email: string) => {
    setUserEmail(email);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUserEmail('');
    setView('login');
  };

  return (
    <main className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: view === 'dashboard' ? 'flex-start' : 'center', justifyContent: 'center' }}>
      {view === 'login' && (
        <Login 
          onNavigateToRegister={() => setView('register')} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {view === 'register' && (
        <Register 
          onNavigateToLogin={() => setView('login')} 
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
      {view === 'dashboard' && (
        <Dashboard 
          userEmail={userEmail} 
          onLogout={handleLogout}
        />
      )}
    </main>
  );
};
