import { apiClient } from './client';
export const analyticsApi = {
    async getLinkAnalytics(id, range = '7d') {
        const res = await apiClient.get(`/api/v1/links/${id}/analytics`, { params: { range } });
        return res.data.data;
    },
    async getOverview() {
        const res = await apiClient.get('/api/v1/analytics/overview');
        return res.data.data;
    },
};
