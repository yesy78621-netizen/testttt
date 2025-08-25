import React, { useState } from 'react';
import { Eye, EyeOff, CreditCard, Shield, ArrowRight, Sparkles, Lock, User } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, role: 'user' | 'admin') => void;
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        alert('Şifreler eşleşmiyor!');
        return;
      }
      
      // Simüle edilmiş API çağrısı
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Demo için admin kullanıcısı kontrolü
      const role = formData.username.toLowerCase().includes('admin') ? 'admin' : 'user';
      onLogin(formData.username, role);
    } catch (error) {
      console.error('Giriş hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo ve Marka */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <CreditCard className="h-10 w-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                PayFlow
              </span>
              <span className="text-white ml-2">Pro</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Gelişmiş Para Transfer Platformu
            </p>
            <div className="flex items-center justify-center mt-3 space-x-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Güvenli • Hızlı • Kolay</span>
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
          </div>

          {/* Auth Form */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl blur"></div>
            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">
              {/* Tab Switcher */}
              <div className="flex rounded-2xl bg-slate-900/50 p-1.5 mb-8 border border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isLogin
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Giriş Yap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    !isLogin
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <span>Kayıt Ol</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                          Ad
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm"
                          placeholder="Adınız"
                          required={!isLogin}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                          Soyad
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm"
                          placeholder="Soyadınız"
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-3">
                        E-posta
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm"
                        placeholder="ornek@email.com"
                        required={!isLogin}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-3">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm"
                        placeholder="05XX XXX XX XX"
                        required={!isLogin}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="Kullanıcı adınızı girin"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Şifre
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm pr-12"
                    placeholder="Şifrenizi girin"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-12 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {!isLogin && (
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      Şifre Tekrar
                    </label>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm pr-12"
                      placeholder="Şifrenizi tekrar girin"
                      required={!isLogin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-12 text-slate-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 ${
                    isLogin
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/25'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25'
                  } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>İşleniyor...</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
                  <Shield className="h-4 w-4" />
                  <span>256-bit SSL şifreleme ile korunmaktadır</span>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Demo: "admin" içeren kullanıcı adı ile admin paneline girin
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;