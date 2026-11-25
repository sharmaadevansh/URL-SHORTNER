import { apiClient } from './client';
export const authApi = {
    async register(input) {
        const res = await apiClient.post('/api/v1/auth/register', input);
        return res.data.data;
    },
    async login(input) {
        const res = await apiClient.post('/api/v1/auth/login', input);
        return res.data.data;
    },
    async logout() {
        await apiClient.post('/api/v1/auth/logout');
    },
    async getMe() {
        const res = await apiClient.get('/api/v1/auth/me');
        return res.data.data;
    },
    async updateProfile(input) {
        const res = await apiClient.patch('/api/v1/auth/profile', input);
        return res.data.data;
    },
    async changePassword(input) {
        await apiClient.post('/api/v1/auth/change-password', input);
    },
    async deleteAccount() {
        await apiClient.delete('/api/v1/auth/account');
    },
};
