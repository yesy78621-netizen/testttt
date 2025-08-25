export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  created_at: string;
}

export interface Bank {
  id: number;
  name: string;
  code: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  fee_percentage: number;
  fixed_fee: number;
  processing_time: string;
  is_active: boolean;
  created_at: string;
}

export interface BankAccount {
  id: number;
  bank_id: number;
  service_id: number;
  account_name: string;
  account_number: string;
  iban: string;
  balance: number;
  is_active: boolean;
  bank_name: string;
  bank_code: string;
  service_name: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  bank_account_id: number;
  service_id: number;
  amount: number;
  fee: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reference_number: string;
  notes?: string;
  processed_by?: number;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  username?: string;
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  service_name?: string;
}

export interface TransactionStats {
  total_count: number;
  total_amount: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
}