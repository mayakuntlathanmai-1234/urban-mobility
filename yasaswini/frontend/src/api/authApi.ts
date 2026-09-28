import api from './axios';
import { User } from '../types';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'ROLE_PASSENGER' | 'ROLE_DRIVER';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}

export const authApi = {
  register: async (dto: RegisterDTO): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/api/auth/register', dto);
    return res.data;
  },

  login: async (dto: LoginDTO): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/api/auth/login', dto);
    return res.data;
  },

  getHealth: async (): Promise<any> => {
    const res = await api.get('/api/health');
    return res.data;
  },
};
