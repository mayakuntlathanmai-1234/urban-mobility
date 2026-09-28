import api from './axios';
import { Ride, EstimateResponse } from '../types';

export interface EstimateDTO {
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
  rideType?: string;
}

export interface CreateRideDTO {
  passengerId: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  fare: number;
  rideType: string;
  paymentMethod: string;
}

export const rideApi = {
  estimateFare: async (dto: EstimateDTO): Promise<EstimateResponse> => {
    const res = await api.post<EstimateResponse>('/api/rides/estimate', dto);
    return res.data;
  },

  createRide: async (dto: CreateRideDTO): Promise<{ message: string; ride: Ride }> => {
    const res = await api.post<{ message: string; ride: Ride }>('/api/rides', dto);
    return res.data;
  },

  listRides: async (): Promise<{ rides: Ride[] }> => {
    const res = await api.get<{ rides: Ride[] }>('/api/rides');
    return res.data;
  },

  getAvailableRides: async (): Promise<{ rides: Ride[] }> => {
    const res = await api.get<{ rides: Ride[] }>('/api/rides/available');
    return res.data;
  },

  getRideById: async (id: string): Promise<{ ride: Ride }> => {
    const res = await api.get<{ ride: Ride }>(`/api/rides/${id}`);
    return res.data;
  },

  acceptRide: async (id: string, driverId?: string): Promise<{ message: string; ride: Ride }> => {
    const res = await api.post<{ message: string; ride: Ride }>(`/api/rides/${id}/accept`, { driverId });
    return res.data;
  },

  markArrived: async (id: string): Promise<{ message: string; ride: Ride }> => {
    const res = await api.post<{ message: string; ride: Ride }>(`/api/rides/${id}/arrive`);
    return res.data;
  },

  startRide: async (id: string): Promise<{ message: string; ride: Ride }> => {
    const res = await api.post<{ message: string; ride: Ride }>(`/api/rides/${id}/start`);
    return res.data;
  },

  completeRide: async (id: string): Promise<{ message: string; ride: Ride }> => {
    const res = await api.post<{ message: string; ride: Ride }>(`/api/rides/${id}/complete`);
    return res.data;
  },
};
