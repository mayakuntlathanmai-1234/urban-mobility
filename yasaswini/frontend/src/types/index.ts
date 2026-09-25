export type Role = 'PASSENGER' | 'DRIVER' | 'ADMIN';
export type RideType = 'BIKE' | 'AUTO' | 'SEDAN' | 'SUV';

export type RideStatus =
  | 'REQUESTED'
  | 'SEARCHING_DRIVER'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'RIDE_STARTED'
  | 'RIDE_COMPLETED'
  | 'PAYMENT_PENDING'
  | 'COMPLETED'
  | 'CANCELLED_BY_RIDER'
  | 'CANCELLED_BY_DRIVER'
  | 'NO_DRIVER_FOUND';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  driverId?: string;
  driver?: Driver;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  type: RideType;
  capacity: number;
}

export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  isOnline: boolean;
  currentLat: number;
  currentLng: number;
  rating: number;
  totalRides: number;
  totalEarnings: number;
  user?: {
    name: string;
    phone?: string;
    email?: string;
  };
  vehicle?: Vehicle;
}

export interface Ride {
  id: string;
  rideNumber: string;
  passengerId: string;
  driverId?: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  destLat: number;
  destLng: number;
  destAddress: string;
  rideType: RideType;
  status: RideStatus;
  distanceKm: number;
  estimatedTimeMin: number;
  baseFare: number;
  perKmFare: number;
  estimatedFare: number;
  finalFare?: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  requestedAt: string;
  assignedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;

  passenger?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  driver?: {
    id: string;
    rating: number;
    user?: {
      name: string;
      phone?: string;
    };
    vehicle?: Vehicle;
  };
  payment?: Payment;
  rating?: Rating;
}

export interface Payment {
  id: string;
  rideId: string;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  rideId: string;
  passengerId: string;
  driverId: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface FareEstimate {
  vehicleType: RideType;
  baseFare: number;
  perKmFare: number;
  estimatedFare: number;
  distanceKm: number;
  estimatedTimeMin: number;
  capacity: number;
  description: string;
}

export interface FareConfig {
  id: string;
  vehicleType: RideType;
  baseFare: number;
  perKmFare: number;
  perMinFare: number;
  minFare: number;
  capacity: number;
  description: string;
}
