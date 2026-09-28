export type Role = 'ROLE_PASSENGER' | 'ROLE_DRIVER' | 'ROLE_ADMIN' | 'PASSENGER' | 'DRIVER' | 'ADMIN';

export type RideStatus =
  | 'REQUESTED'
  | 'SEARCHING_DRIVER'
  | 'WAITING_FOR_DRIVER'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'RIDE_STARTED'
  | 'COMPLETED'
  | 'RIDE_COMPLETED'
  | 'PAYMENT_PENDING'
  | 'CANCELLED'
  | 'NO_DRIVER_FOUND';

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'WALLET';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type RideType = 'ECONOMY' | 'PREMIUM' | 'AUTO' | 'BIKE' | 'SUV';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  createdAt?: string;
  driver?: Driver;
}

export interface Vehicle {
  id?: string;
  driverId?: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  plateNumber: string;
  rideType?: string;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  licenseNumber?: string;
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
  totalEarnings?: number;
  totalRides?: number;
  rating?: number;
  vehicle?: Vehicle;
  user?: User;
}

export interface Ride {
  id: string;
  rideNumber?: string;
  passengerId: string;
  driverId?: string | null;
  pickupAddress: string;
  dropoffAddress?: string;
  destAddress?: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat?: number;
  dropoffLng?: number;
  destLat?: number;
  destLng?: number;
  fare?: number;
  estimatedFare?: number;
  finalFare?: number;
  baseFare?: number;
  perKmFare?: number;
  distanceKm?: number;
  estimatedTimeMin?: number;
  rideType: RideType;
  status: RideStatus;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  requestedAt?: string;
  completedAt?: string;
  driverName?: string;
  vehicleDetails?: string;
  passenger?: User;
  driver?: Driver;
  cancelReason?: string;
}

export interface Payment {
  id: string;
  rideId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt?: string;
}

export interface FareEstimate {
  vehicleType?: string;
  baseFare: number;
  perKmFare: number;
  estimatedFare: number;
  capacity?: number;
  estimatedTimeMin?: number;
}

export interface EstimateResponse {
  distanceKm: number;
  estimatedTimeMin: number;
  estimates: Record<string, FareEstimate>;
}

export interface FareConfig {
  id?: string;
  rideType?: string;
  vehicleType?: string;
  baseFare: number;
  perKmFare?: number;
  perKmRate?: number;
  perMinRate?: number;
  surgeMultiplier?: number;
  capacity?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading?: boolean;
}
