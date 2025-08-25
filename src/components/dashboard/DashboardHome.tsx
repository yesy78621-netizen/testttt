import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { apiService } from '../../services/api';
import { 
  Wallet, TrendingUp, Calendar, Clock, ArrowUpRight, ArrowDownRight, 
  CreditCard, Shield, Zap, Award, Eye, EyeOff, Plus, Send, History,
  BarChart3, Users, Target, Sparkles, Loader2
} from 'lucide-react';

interface DashboardHomeProps {
  user: User;
}

interface DashboardStats {
  balance: number;
  todayTransfers: number;
  todayAmount: number;
  weeklyAmount: number;
  monthlyAmount: number;
  totalSaved: number;
}

function DashboardHome({ user }: DashboardHomeProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Paralel olarak verileri çek
      const [transactionsResponse, statsResponse] = await Promise.all([
        apiService.getMyTransactions(),
        apiService.getTransactionStats('daily')
      ]);

      setRecentTransactions(transactionsResponse.transactions || []);
      
      // Stats'ı user balance ile birleştir
      setStats({
        balance: user.balance,
        todayTransfers: statsResponse.stats?.total_count || 0,
        todayAmount: statsResponse.stats?.total_amount || 0,
        weeklyAmount: 0, // Haftalık stats için ayrı çağrı yapılabilir
        monthlyAmount: 0, // Aylık stats için ayrı çağrı yapılabilir
        totalSaved: 0 // Hesaplanabilir
      });
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: Send, label: 'Hızlı Transfer', color: 'from-blue-500 to-blue-600', action: 'transfer' },
    { icon: Plus, label: 'Bakiye Yükle', color: 'from-emerald-500 to-emerald-600', action: 'deposit' },
    { icon: History, label: 'İşlem Geçmişi', color: 'from-purple-500 to-purple-600', action: 'history' },
    { icon: BarChart3, label: 'Raporlar', color: 'from-orange-500 to-orange-600', action: 'reports' }
  ];

  const achievements = [
    { icon: Award, title: 'İlk Transfer', desc: 'İlk transferinizi tamamladınız', earned: recentTransactions.length > 0 },
    { icon: Target, title: 'Güvenilir Kullanıcı', desc: '10+ başarılı transfer', earned: recentTransactions.length >= 10 },
    { icon: Sparkles, title: 'Premium Üye', desc: 'Premium özellikleri kullanın', earned: user.role === 'admin' },
    { icon: Users, title: 'Referans Ustası', desc: '5 arkadaşınızı davet edin', earned: false }
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Dashboard yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-3xl p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Hoş Geldin, <span className="text-yellow-300">{user.username}</span>
              </h1>
              <p className="text-blue-100 text-lg">Bugün nasıl yardımcı olabiliriz?</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Toplam Bakiye</p>
              <div className="flex items-center space-x-2">
                {showBalance ? (
                  <span className="text-3xl font-bold">₺{stats?.balance.toLocaleString() || '0'}</span>
                ) : (
                  <span className="text-3xl font-bold">₺••••••</span>
                )}
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-200 transform hover:scale-105`}
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Bugünkü Transferler</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.todayTransfers || 0}</p>
              <p className="text-emerald-400 text-sm mt-1 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% bu hafta
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Send className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Bugünkü Tutar</p>
              <p className="text-3xl font-bold text-white mt-1">₺{stats?.todayAmount.toLocaleString() || '0'}</p>
              <p className="text-emerald-400 text-sm mt-1 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8% dün'e göre
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Aktif İşlemler</p>
              <p className="text-3xl font-bold text-white mt-1">
                {recentTransactions.filter((t: any) => t.status === 'pending').length}
              </p>
              <p className="text-yellow-400 text-sm mt-1 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Onay bekliyor
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Güvenlik Skoru</p>
              <p className="text-3xl font-bold text-white mt-1">98%</p>
              <p className="text-emerald-400 text-sm mt-1 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Mükemmel
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <History className="h-5 w-5 mr-2 text-blue-400" />
              Son İşlemler
            </h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              Tümünü Gör
            </button>
          </div>

          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Henüz işlem bulunmuyor</p>
                <p className="text-slate-500 text-sm">İlk transferinizi yapmak için yukarıdaki butonları kullanın</p>
              </div>
            ) : (
              recentTransactions.slice(0, 5).map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.status === 'completed' ? 'bg-emerald-500/20' :
                      transaction.status === 'pending' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                    }`}>
                      {transaction.status === 'completed' ? (
                        <ArrowUpRight className="h-6 w-6 text-emerald-400" />
                      ) : transaction.status === 'pending' ? (
                        <Clock className="h-6 w-6 text-yellow-400" />
                      ) : (
                        <ArrowDownRight className="h-6 w-6 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{transaction.bank_name || 'Bilinmeyen Banka'}</p>
                      <p className="text-slate-400 text-sm">{transaction.account_name || 'Bilinmeyen Hesap'}</p>
                      <p className="text-slate-500 text-xs">
                        {new Date(transaction.created_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">₺{transaction.amount.toLocaleString()}</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {transaction.status === 'completed' ? 'Tamamlandı' : 
                       transaction.status === 'pending' ? 'Bekliyor' : 'Başarısız'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-400" />
            Başarımlar
          </h2>
          
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                  achievement.earned 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                    : 'bg-white/5 border border-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  achievement.earned ? 'bg-yellow-500/20' : 'bg-slate-700/50'
                }`}>
                  <achievement.icon className={`h-5 w-5 ${
                    achievement.earned ? 'text-yellow-400' : 'text-slate-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${achievement.earned ? 'text-white' : 'text-slate-400'}`}>
                    {achievement.title}
                  </p>
                  <p className="text-slate-500 text-xs">{achievement.desc}</p>
                </div>
                {achievement.earned && (
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;