import apiClient, { extractData, ApiResponse } from '../lib/api-client';
import { Milestone } from '../types';

/**
 * Payment initialization response for milestone escrow
 */
export interface MilestonePaymentInitResponse {
  payment_url: string;
  reference: string;
  milestone: Milestone;
}

/**
 * Reject milestone request data
 */
export interface RejectMilestoneData {
  reason: string;
}

/**
 * Milestone Service
 * Handles all milestone-related API calls for clients and companies
 */
export const milestoneService = {
  /**
   * Fund milestone escrow (deposit payment) - CLIENT ONLY
   * Returns payment URL to redirect user to payment gateway
   */
  async fundEscrow(id: string): Promise<MilestonePaymentInitResponse> {
    const response = await apiClient.post<ApiResponse<MilestonePaymentInitResponse>>(
      `/client/milestones/${id}/fund`
    );
    return extractData<MilestonePaymentInitResponse>(response);
  },

  /**
   * Approve a milestone - CLIENT ONLY
   * Client approves milestone completion, allowing admin to release escrow
   */
  async approve(id: string): Promise<Milestone> {
    const response = await apiClient.post<ApiResponse<Milestone>>(
      `/client/milestones/${id}/approve`
    );
    return extractData<Milestone>(response);
  },

  /**
   * Reject a milestone - CLIENT ONLY
   * Client rejects milestone, creating a dispute automatically
   */
  async reject(id: string, data: RejectMilestoneData): Promise<Milestone> {
    const response = await apiClient.post<ApiResponse<Milestone>>(
      `/client/milestones/${id}/reject`,
      data
    );
    return extractData<Milestone>(response);
  },

  /**
   * Submit milestone for approval - COMPANY ONLY
   * Company submits completed milestone with evidence for client review
   */
  async submit(id: string): Promise<Milestone> {
    const response = await apiClient.post<ApiResponse<Milestone>>(
      `/company/milestones/${id}/submit`
    );
    return extractData<Milestone>(response);
  },

  /**
   * Verify a milestone - CLIENT ONLY
   * Client verifies milestone before project becomes active
   */
  async verify(id: string, notes?: string): Promise<Milestone> {
    const response = await apiClient.post<ApiResponse<Milestone>>(
      `/client/milestones/${id}/verify`,
      notes ? { notes } : {}
    );
    return extractData<Milestone>(response);
  },

  /**
   * Update client notes on a milestone - CLIENT ONLY
   */
  async updateClientNotes(id: string, notes: string): Promise<Milestone> {
    const response = await apiClient.put<ApiResponse<Milestone>>(
      `/client/milestones/${id}/notes`,
      { notes }
    );
    return extractData<Milestone>(response);
  },

  /**
   * Update company notes on a milestone - COMPANY ONLY
   */
  async updateCompanyNotes(id: string, notes: string): Promise<Milestone> {
    const response = await apiClient.put<ApiResponse<Milestone>>(
      `/company/milestones/${id}/notes`,
      { notes }
    );
    return extractData<Milestone>(response);
  },
};
