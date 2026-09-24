import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { RideType } from '@prisma/client';

export const getAdminMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalDrivers = await prisma.driver.count();
    const onlineDrivers = await prisma.driver.count({ where: { isOnline: true } });
    const activeRides = await prisma.ride.count({
      where: {
        status: {
          in: ['REQUESTED', 'SEARCHING_DRIVER', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'RIDE_STARTED']
        }
      }
    });
    const completedRides = await prisma.ride.count({ where: { status: 'COMPLETED' } });
    const cancelledRides = await prisma.ride.count({
      where: {
        status: { in: ['CANCELLED_BY_RIDER', 'CANCELLED_BY_DRIVER', 'NO_DRIVER_FOUND'] }
      }
    });

    const revenueResult = await prisma.ride.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { finalFare: true, estimatedFare: true }
    });

    const totalRevenue = (revenueResult._sum.finalFare || revenueResult._sum.estimatedFare || 0);

    return res.json({
      metrics: {
        totalUsers,
        totalDrivers,
        onlineDrivers,
        activeRides,
        completedRides,
        cancelledRides,
        totalRevenue: Math.round(totalRevenue)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch admin metrics' });
  }
};

export const getFareConfigs = async (req: AuthRequest, res: Response) => {
  try {
    const configs = await prisma.fareConfig.findMany({
      orderBy: { vehicleType: 'asc' }
    });
    return res.json({ configs });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch fare configurations' });
  }
};

export const updateFareConfig = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleType, baseFare, perKmFare, perMinFare, minFare, capacity, description } = req.body;

    if (!vehicleType) {
      return res.status(400).json({ error: 'Vehicle type required' });
    }

    const config = await prisma.fareConfig.upsert({
      where: { vehicleType: vehicleType as RideType },
      update: {
        baseFare: parseFloat(baseFare),
        perKmFare: parseFloat(perKmFare),
        perMinFare: perMinFare ? parseFloat(perMinFare) : 2.0,
        minFare: minFare ? parseFloat(minFare) : 30.0,
        capacity: capacity ? parseInt(capacity) : 4,
        description: description || ''
      },
      create: {
        vehicleType: vehicleType as RideType,
        baseFare: parseFloat(baseFare),
        perKmFare: parseFloat(perKmFare),
        perMinFare: perMinFare ? parseFloat(perMinFare) : 2.0,
        minFare: minFare ? parseFloat(minFare) : 30.0,
        capacity: capacity ? parseInt(capacity) : 4,
        description: description || `${vehicleType} ride option`
      }
    });

    return res.json({ message: 'Fare configuration updated successfully', config });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update fare configuration' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, search } = req.query;

    let whereClause: any = {};
    if (role) {
      whereClause.role = String(role);
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: String(search) } },
        { email: { contains: String(search) } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          include: {
            vehicle: true
          }
        }
      }
    });

    return res.json({ users });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};
