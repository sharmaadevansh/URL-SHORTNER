import { apiClient } from './client';
import { ApiResponse, LinkAnalytics, AnalyticsOverview, TimeRange } from '@linkforge/shared';

export const analyticsApi = {
  async getLinkAnalytics(id: string, range: TimeRange = '7d'): Promise<LinkAnalytics & { link: any }> {
    const res = await apiClient.get<ApiResponse<LinkAnalytics & { link: any }>>(
      `/api/v1/links/${id}/analytics`,
      { params: { range } }
    );
    return res.data.data!;
  },

  async getOverview(): Promise<AnalyticsOverview> {
    const res = await apiClient.get<ApiResponse<AnalyticsOverview>>('/api/v1/analytics/overview');
    return res.data.data!;
  },
};
