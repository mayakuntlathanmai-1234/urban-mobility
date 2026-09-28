import api from './axios';
import { Payment } from '../types';

export interface ProcessPaymentDTO {
  rideId: string;
  amount: number;
  paymentMethod: string;
}

export const paymentApi = {
  processPayment: async (dto: ProcessPaymentDTO): Promise<{ message: string; payment: Payment }> => {
    const res = await api.post<{ message: string; payment: Payment }>('/api/payments/process', dto);
    return res.data;
  },

  getPaymentByRideId: async (rideId: string): Promise<Payment> => {
    const res = await api.get<Payment>(`/api/payments/ride/${rideId}`);
    return res.data;
  },

  getHealth: async (): Promise<any> => {
    const res = await api.get('/api/payments/health');
    return res.data;
  },
};
