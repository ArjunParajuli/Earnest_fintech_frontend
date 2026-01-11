export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface TaskFilters {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  search?: string;
  page?: number;
  limit?: number;
}
