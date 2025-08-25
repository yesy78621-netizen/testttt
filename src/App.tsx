import React, { useState, useEffect } from 'react';
import { User } from './types';
import { apiService } from './services/api';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import AdminPanel from './components/admin/AdminPanel';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'admin'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await apiService.getCurrentUser();
        setCurrentUser(response.user);
        setCurrentView(response.user.role === 'admin' ? 'admin' : 'dashboard');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await apiService.login(username, password);
      setCurrentUser(response.user);
      setCurrentView(response.user.role === 'admin' ? 'admin' : 'dashboard');
    } catch (error) {
      throw error;
    }
  };

  const handleRegister = async (username: string, email: string, password: string, role: string) => {
    try {
      const response = await apiService.register(username, email, password, role);
      setCurrentUser(response.user);
      setCurrentView(response.user.role === 'admin' ? 'admin' : 'dashboard');
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {currentView === 'admin' ? (
        <AdminPanel user={currentUser} onLogout={handleLogout} onViewChange={setCurrentView} />
      ) : (
        <Dashboard user={currentUser} onLogout={handleLogout} onViewChange={setCurrentView} />
      )}
    </div>
  );
}

export default App;