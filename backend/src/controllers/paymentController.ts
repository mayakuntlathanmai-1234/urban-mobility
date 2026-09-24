import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const processPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { rideId, paymentMethod } = req.body;

    if (!rideId) {
      return res.status(400).json({ error: 'Ride ID required' });
    }

    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    const amount = ride.finalFare || ride.estimatedFare;
    const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    const payment = await prisma.payment.upsert({
      where: { rideId },
      update: {
        status: 'SUCCESS',
        paymentMethod: paymentMethod || ride.paymentMethod || 'CASH',
        amount,
        transactionId
      },
      create: {
        rideId,
        amount,
        paymentMethod: paymentMethod || ride.paymentMethod || 'CASH',
        status: 'SUCCESS',
        transactionId
      }
    });

    await prisma.ride.update({
      where: { id: rideId },
      data: { paymentStatus: 'SUCCESS' }
    });

    return res.json({
      message: 'Payment processed successfully',
      payment,
      receipt: {
        rideNumber: ride.rideNumber,
        amount,
        paymentMethod: payment.paymentMethod,
        transactionId,
        date: new Date()
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to process payment' });
  }
};
