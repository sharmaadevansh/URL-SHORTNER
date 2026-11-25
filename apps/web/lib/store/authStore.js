import { create } from 'zustand';
export const useAuthStore = create((set) => ({
    user: null,
    accessToken: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false,
    isLoading: true,
    login: (token, user) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', token);
            localStorage.setItem('user_info', JSON.stringify(user));
        }
        set({
            accessToken: token,
            user,
            isAuthenticated: true,
            isLoading: false,
        });
    },
    setAccessToken: (token) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', token);
        }
        set({ accessToken: token, isAuthenticated: true });
    },
    setUser: (user) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user_info', JSON.stringify(user));
        }
        set({ user });
    },
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_info');
        }
        set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },
    setLoading: (loading) => set({ isLoading: loading }),
}));
