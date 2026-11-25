import axios from 'axios';
import { useAuthStore } from '../store/authStore';
const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
export const apiClient = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
apiClient.interceptors.response.use((res) => res, async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 &&
        !originalRequest?._retry &&
        !originalRequest?.url?.includes('/auth/login') &&
        !originalRequest?.url?.includes('/auth/register')) {
        originalRequest._retry = true;
        try {
            const refreshRes = await axios.post(`${baseURL}/api/v1/auth/refresh`, {}, { withCredentials: true });
            const newAccessToken = refreshRes.data?.data?.accessToken;
            if (newAccessToken) {
                useAuthStore.getState().setAccessToken(newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            }
        }
        catch {
            useAuthStore.getState().logout();
        }
    }
    return Promise.reject(error);
});
