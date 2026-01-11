import api from '@/lib/api';
import { Task, TaskFilters } from '@/types';

export const taskService = {
    async getTasks(filters: TaskFilters = {}) {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);

        const response = await api.get<{ tasks: Task[]; pagination: any }>(`/tasks?${params.toString()}`);
        return response.data;
    },

    async createTask(data: { title: string; description?: string; status?: string }) {
        const response = await api.post<{ task: Task }>('/tasks', data);
        return response.data;
    },

    async updateTask(id: number, data: { title?: string; description?: string; status?: string }) {
        const response = await api.put<{ task: Task }>(`/tasks/${id}`, data);
        return response.data;
    },

    async deleteTask(id: number) {
        const response = await api.delete<{ message: string }>(`/tasks/${id}`);
        return response.data;
    },

    async toggleTaskStatus(id: number) {
        const response = await api.post<{ task: Task }>(`/tasks/${id}/toggle`);
        return response.data;
    },
};
