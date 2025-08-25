import React, { useState } from 'react';
import { CreditCard, Home, ArrowLeftRight, LogOut, Settings, Bell, User, Menu, X } from 'lucide-react';
import { User as UserType } from '../../App';

interface NavbarProps {
  user: UserType;
  currentView: 'home' | 'transfer';
  onViewChange: (view: 'home' | 'transfer') => void;
  onLogout: () => void;
  onAdminPanel: () => void;
}

function Navbar({ user, currentView, onViewChange, onLogout, onAdminPanel }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, message: 'Transfer işleminiz onaylandı', time: '5 dk önce', type: 'success' },
    { id: 2, message: 'Yeni güvenlik güncellemesi mevcut', time: '1 saat önce', type: 'info' },
    { id: 3, message: 'Aylık limit uyarısı', time: '2 saat önce', type: 'warning' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                PayFlow Pro
              </span>
              <div className="text-xs text-slate-400 -mt-1">Profesyonel Platform</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => onViewChange('home')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                currentView === 'home'
                  ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="font-medium">Ana Sayfa</span>
            </button>
            
            <button
              onClick={() => onViewChange('transfer')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                currentView === 'transfer'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span className="font-medium">Para Transferi</span>
            </button>

            {user.role === 'admin' && (
              <button
                onClick={onAdminPanel}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
              >
                <Settings className="h-4 w-4" />
                <span className="font-medium">Admin Panel</span>
              </button>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
                  <div className="p-4 border-b border-slate-700/50">
                    <h3 className="text-white font-semibold">Bildirimler</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors">
                        <p className="text-white text-sm">{notification.message}</p>
                        <p className="text-slate-400 text-xs mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-white">{user.username}</p>
                <p className="text-xs text-slate-400">
                  {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline font-medium">Çıkış</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 py-4">
            <div className="space-y-2">
              <button
                onClick={() => {
                  onViewChange('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentView === 'home'
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Ana Sayfa</span>
              </button>
              
              <button
                onClick={() => {
                  onViewChange('transfer');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentView === 'transfer'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span>Para Transferi</span>
              </button>

              {user.role === 'admin' && (
                <button
                  onClick={() => {
                    onAdminPanel();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;