import apiClient, { extractData, extractMeta, ApiResponse } from '../lib/api-client';
import { PaginationMeta, Project, Milestone } from '../types';

/**
 * Create project request data
 */
export interface CreateProjectData {
  consultation_id: string;
  title: string;
  description?: string;
  location: string;
  budget_min?: number;
  budget_max?: number;
}

/**
 * Project Service
 */
export const projectService = {
  async list(params?: { per_page?: number }): Promise<{ projects: Project[]; meta: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<Project[]>>('/client/projects', {
      params,
    });
    
    const projects = extractData<Project[]>(response);
    const meta = extractMeta(response) as PaginationMeta;
    
    return { projects, meta };
  },

  async listForCompany(params?: { per_page?: number }): Promise<{ projects: Project[]; meta: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<Project[]>>('/company/projects', {
      params,
    });
    
    const projects = extractData<Project[]>(response);
    const meta = extractMeta(response) as PaginationMeta;
    
    return { projects, meta };
  },

  async get(id: string): Promise<Project> {
    const response = await apiClient.get<ApiResponse<Project>>(`/client/projects/${id}`);
    return extractData<Project>(response);
  },

  async getForCompany(id: string): Promise<Project> {
    const response = await apiClient.get<ApiResponse<Project>>(`/company/projects/${id}`);
    return extractData<Project>(response);
  },

  async getShared(id: string): Promise<Project> {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return extractData<Project>(response);
  },

  async create(data: CreateProjectData): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>('/client/projects', data);
    return extractData<Project>(response);
  },

  async createMilestones(projectId: string, milestones: Array<{
    title: string;
    description?: string;
    amount: number;
    sequence_order: number;
  }>): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>(
      `/company/projects/${projectId}/milestones`,
      { milestones }
    );
    return extractData<Project>(response);
  },

  async complete(projectId: string): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>(
      `/client/projects/${projectId}/complete`
    );
    return extractData<Project>(response);
  },

  async completeForCompany(projectId: string): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>(
      `/company/projects/${projectId}/complete`
    );
    return extractData<Project>(response);
  },
};
