import apiClient, { extractData, ApiResponse } from '../lib/api-client';

/**
 * Payment Account interface
 */
export interface PaymentAccount {
  id: string; // UUID
  user_id: string; // UUID
  account_name: string;
  account_number: string;
  bank_code: string;
  bank_name?: string;
  account_type: 'nuban' | 'mobile_money';
  currency: string;
  is_default: boolean;
  is_verified: boolean;
  recipient_code?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create Payment Account data
 */
export interface CreatePaymentAccountData {
  account_name: string;
  account_number: string;
  bank_code: string;
  bank_name?: string;
  account_type?: 'nuban' | 'mobile_money';
  currency?: string;
  is_default?: boolean;
}

/**
 * Update Payment Account data
 */
export interface UpdatePaymentAccountData {
  account_name?: string;
  account_number?: string;
  bank_code?: string;
  bank_name?: string;
  is_default?: boolean;
}

/**
 * Payment Account Service
 * Handles payment account management
 */
export const paymentAccountService = {
  /**
   * List all payment accounts for the current user
   */
  async list(): Promise<PaymentAccount[]> {
    const response = await apiClient.get<ApiResponse<PaymentAccount[]>>('/payment-accounts');
    return extractData<PaymentAccount[]>(response);
  },

  /**
   * Create a new payment account
   */
  async create(data: CreatePaymentAccountData): Promise<PaymentAccount> {
    const response = await apiClient.post<ApiResponse<PaymentAccount>>('/payment-accounts', data);
    return extractData<PaymentAccount>(response);
  },

  /**
   * Update a payment account
   */
  async update(id: string, data: UpdatePaymentAccountData): Promise<PaymentAccount> {
    const response = await apiClient.put<ApiResponse<PaymentAccount>>(`/payment-accounts/${id}`, data);
    return extractData<PaymentAccount>(response);
  },

  /**
   * Delete a payment account
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/payment-accounts/${id}`);
  },

  /**
   * Set an account as default
   */
  async setDefault(id: string): Promise<PaymentAccount> {
    const response = await apiClient.post<ApiResponse<PaymentAccount>>(`/payment-accounts/${id}/set-default`);
    return extractData<PaymentAccount>(response);
  },

  /**
   * Get list of banks
   */
  async getBanks(): Promise<Array<{ code: string; name: string }>> {
    const response = await apiClient.get<ApiResponse<Array<{ code: string; name: string }>>>('/payment-accounts/banks');
    return extractData(response);
  },

  /**
   * Verify bank account
   */
  async verifyAccount(accountNumber: string, bankCode: string): Promise<{
    account_number: string;
    account_name: string;
    bank_id?: string;
  }> {
    const response = await apiClient.post<ApiResponse<{
      account_number: string;
      account_name: string;
      bank_id?: string;
    }>>('/payment-accounts/verify', {
      account_number: accountNumber,
      bank_code: bankCode,
    });
    return extractData(response);
  },
};
