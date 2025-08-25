const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Bir hata oluştu');
    }

    return data;
  }

  // Auth
  async login(username: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    this.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  }

  async register(username: string, email: string, password: string, role: string = 'user') {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    });
    
    this.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Transactions
  async getMyTransactions() {
    return this.request('/transactions/my-transactions');
  }

  async createTransaction(transactionData: any) {
    return this.request('/transactions/create', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async getPendingTransactions() {
    return this.request('/transactions/pending');
  }

  async updateTransactionStatus(id: string, status: string) {
    return this.request(`/transactions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getTransactionStats(period: string = 'daily') {
    return this.request(`/transactions/stats?period=${period}`);
  }

  // Banks
  async getBanks() {
    return this.request('/banks');
  }

  async getBankAccounts(bankId?: string, serviceId?: string) {
    const params = new URLSearchParams();
    if (bankId) params.append('bank_id', bankId);
    if (serviceId) params.append('service_id', serviceId);
    
    return this.request(`/banks/accounts?${params.toString()}`);
  }

  // Services
  async getServices() {
    return this.request('/services');
  }

  async calculateFee(serviceId: string, amount: number) {
    return this.request('/services/calculate-fee', {
      method: 'POST',
      body: JSON.stringify({ service_id: serviceId, amount }),
    });
  }
}

export const apiService = new ApiService();