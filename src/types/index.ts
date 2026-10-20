/**
 * Standard API Response Format
 * Matches backend ApiResponse format: { success, message, data, errors, meta }
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: Record<string, any>;
}

/**
 * User interface matching backend User model
 */
export interface User {
  id: string; // UUID
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'company' | 'admin';
  status: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  company?: any; // Company details if role is 'company'
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role: 'client' | 'company';
}

/**
 * Auth response containing user and token
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Pagination meta
 */
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

/**
 * Company interface
 */
export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Consultation interface
 */
export interface Consultation {
  id: string;
  client_id: string;
  company_id: string;
  scheduled_at: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  is_completed: boolean;
  notes?: string;
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
 * Project interface
 */
export interface Project {
  id: string;
  client_id: string;
  company_id: string;
  title: string;
  description?: string;
  location: string;
  budget_min?: number;
  budget_max?: number;
  status: 'draft' | 'active' | 'completed' | 'disputed' | 'cancelled';
  company?: Company;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  milestones?: Milestone[];
  disputes?: Array<{
    id: string;
    milestone_id?: string;
    raised_by: string;
    reason: string;
    status: 'open' | 'resolved' | 'escalated';
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

/**
 * Milestone interface
 */
export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  amount: number;
  sequence_order: number;
  status: 'pending' | 'funded' | 'submitted' | 'approved' | 'rejected' | 'released';
  verified_at?: string;
  verified_by?: string;
  client_notes?: string;
  company_notes?: string;
  escrow?: {
    id: string;
    milestone_id: string;
    amount: number;
    platform_fee?: number;
    net_amount?: number;
    status: 'held' | 'released' | 'refunded';
    created_at: string;
    released_at?: string;
  };
  created_at: string;
  updated_at: string;
}
