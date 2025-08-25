import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { apiService } from '../../services/api';
import { ArrowRight, CheckCircle, Clock, CreditCard, Loader2, AlertCircle } from 'lucide-react';

interface TransferMoneyProps {
  user: User;
}

function TransferMoney({ user }: TransferMoneyProps) {
  const [step, setStep] = useState<'amount' | 'service' | 'bank' | 'account' | 'confirm' | 'success'>('amount');
  const [amount, setAmount] = useState<string>('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [notes, setNotes] = useState('');
  
  const [services, setServices] = useState([]);
  const [banks, setBanks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [fee, setFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step === 'service') {
      loadServices();
    } else if (step === 'bank') {
      loadBanks();
    } else if (step === 'account' && selectedBank && selectedService) {
      loadAccounts();
    }
  }, [step, selectedBank, selectedService]);

  useEffect(() => {
    if (selectedService && amount) {
      calculateFee();
    }
  }, [selectedService, amount]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getServices();
      setServices(response.services || []);
    } catch (error) {
      setError('Servisler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadBanks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBanks();
      setBanks(response.banks || []);
    } catch (error) {
      setError('Bankalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBankAccounts(selectedBank.id.toString(), selectedService.id.toString());
      setAccounts(response.accounts || []);
    } catch (error) {
      setError('Hesaplar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = async () => {
    try {
      const response = await apiService.calculateFee(selectedService.id.toString(), parseFloat(amount));
      setFee(response.fee || 0);
    } catch (error) {
      console.error('Ücret hesaplanırken hata:', error);
    }
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && numAmount <= user.balance) {
      setError('');
      setStep('service');
    } else if (numAmount > user.balance) {
      setError('Yetersiz bakiye');
    } else {
      setError('Geçerli bir tutar girin');
    }
  };

  const handleServiceSelect = (service: any) => {
    const numAmount = parseFloat(amount);
    if (numAmount >= service.min_amount && numAmount <= service.max_amount) {
      setSelectedService(service);
      setError('');
      setStep('bank');
    } else {
      setError(`Bu servis için minimum ${service.min_amount}₺, maksimum ${service.max_amount}₺ transfer yapabilirsiniz.`);
    }
  };

  const handleBankSelect = (bank: any) => {
    setSelectedBank(bank);
    setStep('account');
  };

  const handleAccountSelect = (account: any) => {
    setSelectedAccount(account);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError('');

      const transactionData = {
        bank_account_id: selectedAccount.id,
        service_id: selectedService.id,
        amount: parseFloat(amount),
        notes: notes
      };

      await apiService.createTransaction(transactionData);
      setStep('success');
    } catch (error: any) {
      setError(error.message || 'İşlem oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetTransfer = () => {
    setStep('amount');
    setAmount('');
    setSelectedService(null);
    setSelectedBank(null);
    setSelectedAccount(null);
    setNotes('');
    setFee(0);
    setError('');
  };

  const getAvailableServices = () => {
    const numAmount = parseFloat(amount);
    return services.filter((service: any) => 
      numAmount >= service.min_amount && numAmount <= service.max_amount
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Para Transferi</h1>
        <p className="text-slate-400">Güvenli ve hızlı para transfer işlemi yapın</p>
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-blue-400 text-sm">
            💰 Mevcut Bakiye: <span className="font-semibold">₺{user.balance.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8 space-x-4">
        {['amount', 'service', 'bank', 'account', 'confirm'].map((stepName, index) => (
          <div key={stepName} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                step === stepName
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                  : ['amount', 'service', 'bank', 'account', 'confirm'].indexOf(step) > index
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {['amount', 'service', 'bank', 'account', 'confirm'].indexOf(step) > index ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < 4 && (
              <ArrowRight className="h-4 w-4 text-slate-600 mx-2" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
        )}

        {!loading && step === 'amount' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Transfer Tutarını Girin</h2>
            <form onSubmit={handleAmountSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Transfer Tutarı (₺)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="1"
                  max={user.balance}
                  step="0.01"
                  required
                />
                <p className="text-slate-400 text-sm mt-2">
                  Maksimum: ₺{user.balance.toLocaleString()}
                </p>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                Devam Et
              </button>
            </form>
          </div>
        )}

        {!loading && step === 'service' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Servis Seçin</h2>
            <div className="grid gap-4">
              {getAvailableServices().map((service: any) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="p-6 bg-slate-900/50 border border-slate-700 rounded-xl text-left hover:border-blue-500/50 hover:bg-slate-900/70 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{service.name}</h3>
                      <p className="text-slate-400 text-sm mb-2">{service.description}</p>
                      <p className="text-slate-400 text-sm">
                        Limit: {service.min_amount}₺ - {service.max_amount}₺
                      </p>
                      <p className="text-blue-400 text-sm mt-1">
                        İşlem Süresi: {service.processing_time}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && step === 'bank' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Banka Seçin</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {banks.map((bank: any) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankSelect(bank)}
                  className="p-6 bg-slate-900/50 border border-slate-700 rounded-xl text-center hover:border-emerald-500/50 hover:bg-slate-900/70 transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-medium">{bank.name}</h3>
                  <p className="text-slate-400 text-sm">{bank.code}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && step === 'account' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Hesap Seçin</h2>
            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Bu banka ve servis için hesap bulunamadı</p>
                <button
                  onClick={() => setStep('bank')}
                  className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Geri Dön
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account: any) => (
                  <button
                    key={account.id}
                    onClick={() => handleAccountSelect(account)}
                    className="w-full p-6 bg-slate-900/50 border border-slate-700 rounded-xl text-left hover:border-purple-500/50 hover:bg-slate-900/70 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{account.account_name}</h3>
                        <p className="text-slate-400">{account.account_number}</p>
                        <p className="text-emerald-400 text-sm mt-1">
                          Bakiye: ₺{account.balance.toLocaleString()}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && step === 'confirm' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">İşlemi Onaylayın</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-3 border-b border-slate-700">
                <span className="text-slate-400">Transfer Tutarı</span>
                <span className="text-white font-semibold">₺{parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-700">
                <span className="text-slate-400">Servis</span>
                <span className="text-white">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-700">
                <span className="text-slate-400">Banka</span>
                <span className="text-white">{selectedBank?.name}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-700">
                <span className="text-slate-400">Hesap</span>
                <span className="text-white">{selectedAccount?.account_name}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-700">
                <span className="text-slate-400">İşlem Ücreti</span>
                <span className="text-white">₺{fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-semibold">
                <span className="text-white">Toplam Tutar</span>
                <span className="text-emerald-400">
                  ₺{(parseFloat(amount) + fee).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Not (İsteğe bağlı)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="İşlem notu..."
                rows={3}
              />
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'İşleniyor...' : 'İşlemi Onayla'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">İşlem Başarıyla Gönderildi</h2>
            <p className="text-slate-400 mb-6">
              Transfer talebiniz admin onayına gönderildi. Onaylandığında bildirim alacaksınız.
            </p>
            <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-yellow-400">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Admin Onayı Bekleniyor</span>
              </div>
            </div>
            <button
              onClick={resetTransfer}
              className="py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200"
            >
              Yeni Transfer Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransferMoney;