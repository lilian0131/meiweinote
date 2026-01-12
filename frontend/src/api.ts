import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface FoodRecord {
  id?: number;
  shopName: string;
  address: string;
  dishName: string;
  cuisineTags: string;
  regionTags: string;
  createdAt?: string;
}

export interface User {
  id: number;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data)
};

export const foodApi = {
  getAll: () => api.get<FoodRecord[]>('/records'),
  getById: (id: number) => api.get<FoodRecord>(`/records/${id}`),
  create: (data: FoodRecord) => api.post<FoodRecord>('/records', data),
  update: (id: number, data: FoodRecord) => api.put<FoodRecord>(`/records/${id}`, data),
  delete: (id: number) => api.delete(`/records/${id}`)
};

export default api;
