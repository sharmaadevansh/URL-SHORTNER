import { apiClient } from './client';
export const linksApi = {
    async createLink(input) {
        const res = await apiClient.post('/api/v1/links', input);
        return res.data.data;
    },
    async getLinks(params) {
        const res = await apiClient.get('/api/v1/links', {
            params,
        });
        return res.data.data;
    },
    async getLink(id) {
        const res = await apiClient.get(`/api/v1/links/${id}`);
        return res.data.data;
    },
    async updateLink(id, input) {
        const res = await apiClient.patch(`/api/v1/links/${id}`, input);
        return res.data.data;
    },
    async updateStatus(id, input) {
        const res = await apiClient.patch(`/api/v1/links/${id}/status`, input);
        return res.data.data;
    },
    async deleteLink(id) {
        await apiClient.delete(`/api/v1/links/${id}`);
    },
};
