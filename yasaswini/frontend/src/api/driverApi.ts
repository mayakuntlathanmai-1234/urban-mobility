import api from './axios';
import { Driver } from '../types';

export const driverApi = {
  getAllDrivers: async (): Promise<{ drivers: Driver[] }> => {
    const res = await api.get<{ drivers: Driver[] }>('/api/drivers');
    return res.data;
  },

  getDriverById: async (id: string): Promise<Driver> => {
    const res = await api.get<Driver>(`/api/drivers/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, isOnline: boolean): Promise<{ message: string; driver: Driver }> => {
    const res = await api.post<{ message: string; driver: Driver }>(`/api/drivers/${id}/status`, { isOnline });
    return res.data;
  },

  updateLocation: async (id: string, latitude: number, longitude: number): Promise<{ message: string; location: { latitude: number; longitude: number } }> => {
    const res = await api.post<{ message: string; location: { latitude: number; longitude: number } }>(`/api/drivers/${id}/location`, { latitude, longitude });
    return res.data;
  },

  getNearbyDrivers: async (): Promise<{ drivers: Driver[] }> => {
    const res = await api.get<{ drivers: Driver[] }>('/api/drivers/nearby');
    return res.data;
  },

  getDashboardStats: async (): Promise<any> => {
    const res = await api.get('/api/drivers/dashboard');
    return res.data;
  },
};
