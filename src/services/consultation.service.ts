import apiClient, { extractData, extractMeta, ApiResponse } from '../lib/api-client';
import { PaginationMeta } from '../types';

/**
 * Company interface
 */
export interface Company {
  id: string;
  user_id: string;
  company_name: string;
  registration_number: string;
  license_documents?: string[];
  portfolio_links?: string[];
  specialization?: string[];
  consultation_fee?: number;
  verified_at?: string;
  status: string;
  is_verified: boolean;
  is_approved: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * Consultation interface
 */
export interface Consultation {
  id: string;
  client_id: string;
  company_id: string;
  scheduled_at: string;
  duration_minutes: number;
  price: number;
  platform_fee?: number;
  net_amount?: number;
  platform_fee_percentage?: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  meeting_link?: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  is_paid: boolean;
  is_completed: boolean;
  company?: Company;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Create consultation request data
 */
export interface CreateConsultationData {
  company_id: string;
  scheduled_at: string;
  duration_minutes?: number;
}

/**
 * Payment initialization response
 */
export interface PaymentInitResponse {
  payment_url: string;
  reference: string;
  consultation: Consultation;
}

/**
 * Consultation Service
 */
export const consultationService = {
  async list(params?: { per_page?: number }): Promise<{ consultations: Consultation[]; meta: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<Consultation[]>>('/client/consultations', {
      params,
    });
    
    const consultations = extractData<Consultation[]>(response);
    const meta = extractMeta(response) as PaginationMeta;
    
    return { consultations, meta };
  },

  async listForCompany(params?: { per_page?: number }): Promise<{ consultations: Consultation[]; meta: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<Consultation[]>>('/company/consultations', {
      params,
    });
    
    const consultations = extractData<Consultation[]>(response);
    const meta = extractMeta(response) as PaginationMeta;
    
    return { consultations, meta };
  },

  async get(id: string): Promise<Consultation> {
    const response = await apiClient.get<ApiResponse<Consultation>>(`/client/consultations/${id}`);
    return extractData<Consultation>(response);
  },

  async getForCompany(id: string): Promise<Consultation> {
    const response = await apiClient.get<ApiResponse<Consultation>>(`/company/consultations/${id}`);
    return extractData<Consultation>(response);
  },

  async create(data: CreateConsultationData): Promise<Consultation> {
    const response = await apiClient.post<ApiResponse<Consultation>>('/client/consultations', data);
    return extractData<Consultation>(response);
  },

  async pay(id: string): Promise<PaymentInitResponse> {
    const response = await apiClient.post<ApiResponse<PaymentInitResponse>>(
      `/client/consultations/${id}/pay`
    );
    return extractData<PaymentInitResponse>(response);
  },

  async complete(id: string): Promise<Consultation> {
    const response = await apiClient.post<ApiResponse<Consultation>>(
      `/company/consultations/${id}/complete`
    );
    return extractData<Consultation>(response);
  },
};
