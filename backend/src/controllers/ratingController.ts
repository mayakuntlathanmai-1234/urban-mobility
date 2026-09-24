import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const submitRating = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const { rideId, score, comment } = req.body;

    if (!rideId || !score) {
      return res.status(400).json({ error: 'Ride ID and score are required' });
    }

    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    if (!ride.driverId) {
      return res.status(400).json({ error: 'No driver assigned to this ride' });
    }

    const rating = await prisma.rating.create({
      data: {
        rideId,
        passengerId: req.user.id,
        driverId: ride.driverId,
        score: parseInt(score),
        comment: comment || null
      }
    });

    // Update driver average rating
    const driverRatings = await prisma.rating.findMany({
      where: { driverId: ride.driverId }
    });

    const avgRating =
      driverRatings.reduce((sum, r) => sum + r.score, 0) / driverRatings.length;

    await prisma.driver.update({
      where: { id: ride.driverId },
      data: { rating: Math.round(avgRating * 10) / 10 }
    });

    return res.status(201).json({
      message: 'Rating submitted successfully',
      rating,
      updatedDriverRating: Math.round(avgRating * 10) / 10
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to submit rating' });
  }
};
