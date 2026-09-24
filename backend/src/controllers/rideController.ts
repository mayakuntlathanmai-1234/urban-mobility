import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { calculateFare, getAllFareEstimates } from '../services/fareService';
import { RideType } from '@prisma/client';
import { io } from '../index';

export const estimateFare = async (req: AuthRequest, res: Response) => {
  try {
    const { pickupLat, pickupLng, destLat, destLng } = req.body;

    if (!pickupLat || !pickupLng || !destLat || !destLng) {
      return res.status(400).json({ error: 'Pickup and Destination coordinates required' });
    }

    // Distance calculation using Haversine formula (in km)
    const distanceKm = calculateHaversineDistance(
      parseFloat(pickupLat),
      parseFloat(pickupLng),
      parseFloat(destLat),
      parseFloat(destLng)
    );

    // Travel time estimate based on average 30 km/h speed
    const estimatedTimeMin = Math.max(5, Math.round((distanceKm / 30) * 60));

    const estimates = await getAllFareEstimates(distanceKm, estimatedTimeMin);

    return res.json({
      distanceKm: Math.round(distanceKm * 10) / 10,
      estimatedTimeMin,
      estimates
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to calculate fare estimate', details: error.message });
  }
};

export const createRide = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const {
      pickupLat,
      pickupLng,
      pickupAddress,
      destLat,
      destLng,
      destAddress,
      rideType,
      paymentMethod
    } = req.body;

    if (!pickupLat || !pickupLng || !pickupAddress || !destLat || !destLng || !destAddress || !rideType) {
      return res.status(400).json({ error: 'Missing required ride parameters' });
    }

    const distanceKm = calculateHaversineDistance(
      parseFloat(pickupLat),
      parseFloat(pickupLng),
      parseFloat(destLat),
      parseFloat(destLng)
    );

    const estimatedTimeMin = Math.max(5, Math.round((distanceKm / 30) * 60));
    const selectedType = (rideType as RideType) || 'SEDAN';

    const fare = await calculateFare(selectedType, distanceKm, estimatedTimeMin);

    const rideNumber = `URM-${Math.floor(10000 + Math.random() * 90000)}`;

    const ride = await prisma.ride.create({
      data: {
        rideNumber,
        passengerId: req.user.id,
        pickupLat: parseFloat(pickupLat),
        pickupLng: parseFloat(pickupLng),
        pickupAddress,
        destLat: parseFloat(destLat),
        destLng: parseFloat(destLng),
        destAddress,
        rideType: selectedType,
        status: 'SEARCHING_DRIVER',
        distanceKm: Math.round(distanceKm * 10) / 10,
        estimatedTimeMin,
        baseFare: fare.baseFare,
        perKmFare: fare.perKmFare,
        estimatedFare: fare.estimatedFare,
        paymentMethod: paymentMethod || 'CASH',
        paymentStatus: 'PENDING'
      },
      include: {
        passenger: {
          select: { id: true, name: true, phone: true, email: true }
        }
      }
    });

    // Create payment entry
    await prisma.payment.create({
      data: {
        rideId: ride.id,
        amount: fare.estimatedFare,
        paymentMethod: paymentMethod || 'CASH',
        status: 'PENDING'
      }
    });

    // Find nearby online drivers matching vehicle type
    const nearbyDrivers = await prisma.driver.findMany({
      where: {
        isOnline: true,
        vehicle: {
          type: selectedType
        }
      },
      include: {
        user: { select: { name: true, phone: true } },
        vehicle: true
      }
    });

    // Broadcast WebSocket notification to drivers
    io.emit('ride:new_request', {
      ride,
      availableDriversCount: nearbyDrivers.length
    });

    return res.status(201).json({
      message: 'Ride request created, searching for nearby drivers...',
      ride
    });
  } catch (error: any) {
    console.error('Error creating ride:', error);
    return res.status(500).json({ error: 'Failed to create ride request', details: error.message });
  }
};

export const acceptRide = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'DRIVER') {
      return res.status(403).json({ error: 'Only drivers can accept rides' });
    }

    const { id } = req.params;
    const driverId = req.user.driverId;

    if (!driverId) {
      return res.status(400).json({ error: 'Driver profile not found' });
    }

    const ride = await prisma.ride.findUnique({ where: { id } });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    if (
      ride.status !== 'REQUESTED' &&
      ride.status !== 'SEARCHING_DRIVER' &&
      !(ride.status === 'DRIVER_ASSIGNED' && ride.driverId === driverId)
    ) {
      return res.status(400).json({ error: `Ride cannot be accepted in state ${ride.status}` });
    }

    const updatedRide = await prisma.ride.update({
      where: { id },
      data: {
        driverId,
        status: 'DRIVER_ASSIGNED',
        assignedAt: new Date()
      },
      include: {
        passenger: { select: { id: true, name: true, phone: true, email: true } },
        driver: {
          include: {
            user: { select: { name: true, phone: true } },
            vehicle: true
          }
        }
      }
    });

    // Broadcast WebSocket updates
    io.to(`ride:${id}`).emit('ride:status:change', {
      rideId: id,
      status: 'DRIVER_ASSIGNED',
      ride: updatedRide
    });

    io.emit('ride:status:change', {
      rideId: id,
      status: 'DRIVER_ASSIGNED',
      ride: updatedRide
    });

    return res.json({ message: 'Ride accepted successfully', ride: updatedRide });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to accept ride', details: error.message });
  }
};

export const markArrived = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await prisma.ride.update({
      where: { id },
      data: {
        status: 'DRIVER_ARRIVED',
        arrivedAt: new Date()
      },
      include: {
        passenger: { select: { id: true, name: true, phone: true } },
        driver: { include: { user: { select: { name: true, phone: true } }, vehicle: true } }
      }
    });

    io.to(`ride:${id}`).emit('ride:status:change', { rideId: id, status: 'DRIVER_ARRIVED', ride });
    io.emit('ride:status:change', { rideId: id, status: 'DRIVER_ARRIVED', ride });

    return res.json({ message: 'Driver marked as arrived', ride });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update status' });
  }
};

export const startRide = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await prisma.ride.update({
      where: { id },
      data: {
        status: 'RIDE_STARTED',
        startedAt: new Date()
      },
      include: {
        passenger: { select: { id: true, name: true, phone: true } },
        driver: { include: { user: { select: { name: true, phone: true } }, vehicle: true } }
      }
    });

    io.to(`ride:${id}`).emit('ride:status:change', { rideId: id, status: 'RIDE_STARTED', ride });
    io.emit('ride:status:change', { rideId: id, status: 'RIDE_STARTED', ride });

    return res.json({ message: 'Ride started', ride });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to start ride' });
  }
};

export const completeRide = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await prisma.ride.findUnique({ where: { id } });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    const finalFare = ride.estimatedFare;

    const updatedRide = await prisma.ride.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        finalFare,
        paymentStatus: 'SUCCESS',
        completedAt: new Date()
      },
      include: {
        passenger: { select: { id: true, name: true, phone: true } },
        driver: { include: { user: { select: { name: true, phone: true } }, vehicle: true } }
      }
    });

    // Update payment record
    await prisma.payment.updateMany({
      where: { rideId: id },
      data: { status: 'SUCCESS', amount: finalFare, transactionId: `TXN-${Date.now()}` }
    });

    // Update driver earnings and total rides
    if (ride.driverId) {
      await prisma.driver.update({
        where: { id: ride.driverId },
        data: {
          totalRides: { increment: 1 },
          totalEarnings: { increment: finalFare }
        }
      });
    }

    io.to(`ride:${id}`).emit('ride:status:change', { rideId: id, status: 'COMPLETED', ride: updatedRide });
    io.emit('ride:status:change', { rideId: id, status: 'COMPLETED', ride: updatedRide });

    return res.json({ message: 'Ride completed successfully', ride: updatedRide });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to complete ride' });
  }
};

export const cancelRide = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const isDriver = req.user?.role === 'DRIVER';

    const status = isDriver ? 'CANCELLED_BY_DRIVER' : 'CANCELLED_BY_RIDER';

    const ride = await prisma.ride.update({
      where: { id },
      data: {
        status,
        cancelledAt: new Date(),
        cancelReason: reason || (isDriver ? 'Driver cancelled request' : 'Passenger cancelled request')
      },
      include: {
        passenger: { select: { id: true, name: true } },
        driver: { select: { id: true } }
      }
    });

    io.to(`ride:${id}`).emit('ride:status:change', { rideId: id, status, ride });
    io.emit('ride:status:change', { rideId: id, status, ride });

    return res.json({ message: 'Ride cancelled', ride });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to cancel ride' });
  }
};

export const getRide = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await prisma.ride.findUnique({
      where: { id },
      include: {
        passenger: { select: { id: true, name: true, phone: true, email: true } },
        driver: {
          include: {
            user: { select: { name: true, phone: true } },
            vehicle: true
          }
        },
        payment: true,
        rating: true
      }
    });

    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    return res.json({ ride });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch ride' });
  }
};

export const listRides = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    let whereClause: any = {};

    if (req.user.role === 'PASSENGER') {
      whereClause.passengerId = req.user.id;
    } else if (req.user.role === 'DRIVER' && req.user.driverId) {
      whereClause.driverId = req.user.driverId;
    }

    const rides = await prisma.ride.findMany({
      where: whereClause,
      orderBy: { requestedAt: 'desc' },
      include: {
        passenger: { select: { name: true, phone: true } },
        driver: {
          include: {
            user: { select: { name: true } },
            vehicle: true
          }
        },
        payment: true,
        rating: true
      }
    });

    return res.json({ rides });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to list rides' });
  }
};

// Helper Haversine formula for distance in KM
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
