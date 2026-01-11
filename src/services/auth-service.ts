import api from '@/lib/api';
import { AuthResponse } from '@/types';

export const authService = {
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        return response.data;
    },

    async register(email: string, password: string, name?: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', { email, password, name });
        return response.data;
    },

    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    },
};
