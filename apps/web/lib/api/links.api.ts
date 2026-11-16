import { apiClient } from './client';
import {
  CreateLinkInput,
  UpdateLinkInput,
  UpdateLinkStatusInput,
  LinkQueryParams,
  Link,
  ApiResponse,
  PaginatedResponse,
} from '@linkforge/shared';

export const linksApi = {
  async createLink(input: CreateLinkInput): Promise<Link> {
    const res = await apiClient.post<ApiResponse<Link>>('/api/v1/links', input);
    return res.data.data!;
  },

  async getLinks(params?: LinkQueryParams): Promise<PaginatedResponse<Link>> {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<Link>>>('/api/v1/links', {
      params,
    });
    return res.data.data!;
  },

  async getLink(id: string): Promise<Link> {
    const res = await apiClient.get<ApiResponse<Link>>(`/api/v1/links/${id}`);
    return res.data.data!;
  },

  async updateLink(id: string, input: UpdateLinkInput): Promise<Link> {
    const res = await apiClient.patch<ApiResponse<Link>>(`/api/v1/links/${id}`, input);
    return res.data.data!;
  },

  async updateStatus(id: string, input: UpdateLinkStatusInput): Promise<Link> {
    const res = await apiClient.patch<ApiResponse<Link>>(`/api/v1/links/${id}/status`, input);
    return res.data.data!;
  },

  async deleteLink(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/links/${id}`);
  },
};
