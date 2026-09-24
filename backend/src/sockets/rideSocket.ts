import { Server, Socket } from 'socket.io';
import { prisma } from '../config/db';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Socket client connected: ${socket.id}`);

    // Join ride room
    socket.on('join:ride', (rideId: string) => {
      socket.join(`ride:${rideId}`);
      console.log(`Socket ${socket.id} joined room ride:${rideId}`);
    });

    // Leave ride room
    socket.on('leave:ride', (rideId: string) => {
      socket.leave(`ride:${rideId}`);
    });

    // Driver location update over WebSocket
    socket.on('driver:location:update', async (data: { driverId: string; latitude: number; longitude: number; activeRideId?: string }) => {
      const { driverId, latitude, longitude, activeRideId } = data;

      try {
        await prisma.driver.update({
          where: { id: driverId },
          data: { currentLat: latitude, currentLng: longitude }
        });

        if (activeRideId) {
          io.to(`ride:${activeRideId}`).emit('driver:location:update', {
            driverId,
            latitude,
            longitude,
            timestamp: new Date()
          });
        }

        io.emit('driver:location:update', {
          driverId,
          latitude,
          longitude,
          timestamp: new Date()
        });
      } catch (err) {
        console.error('Socket driver location update error:', err);
      }
    });

    // Automated simulation trigger for demo testing
    socket.on('simulation:start', async (data: { rideId: string; driverId: string }) => {
      const { rideId, driverId } = data;
      console.log(`🚀 Starting automated driver simulation for ride ${rideId}...`);
      runRideSimulation(io, rideId, driverId);
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });
}

// Automated GPS simulation helper function
async function runRideSimulation(io: Server, rideId: string, driverId: string) {
  try {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) return;

    // Phase 1: Driver moves to pickup point
    const startLat = 16.5062;
    const startLng = 80.6480;
    const pickupLat = ride.pickupLat;
    const pickupLng = ride.pickupLng;
    const destLat = ride.destLat;
    const destLng = ride.destLng;

    // Step to pickup over 5 iterations
    for (let i = 1; i <= 5; i++) {
      await delay(1200);
      const curLat = startLat + (pickupLat - startLat) * (i / 5);
      const curLng = startLng + (pickupLng - startLng) * (i / 5);

      io.to(`ride:${rideId}`).emit('driver:location:update', {
        driverId,
        latitude: curLat,
        longitude: curLng,
        timestamp: new Date()
      });
      io.emit('driver:location:update', { driverId, latitude: curLat, longitude: curLng });
    }

    // Mark arrived
    await delay(1000);
    const arrivedRide = await prisma.ride.update({
      where: { id: rideId },
      data: { status: 'DRIVER_ARRIVED', arrivedAt: new Date() },
      include: { passenger: { select: { id: true, name: true, phone: true } }, driver: { include: { user: { select: { name: true, phone: true } }, vehicle: true } } }
    });
    io.to(`ride:${rideId}`).emit('ride:status:change', { rideId, status: 'DRIVER_ARRIVED', ride: arrivedRide });
    io.emit('ride:status:change', { rideId, status: 'DRIVER_ARRIVED', ride: arrivedRide });

    // Mark started
    await delay(2000);
    const startedRide = await prisma.ride.update({
      where: { id: rideId },
      data: { status: 'RIDE_STARTED', startedAt: new Date() },
      include: { passenger: { select: { id: true, name: true, phone: true } }, driver: { include: { user: { select: { name: true, phone: true } }, vehicle: true } } }
    });
    io.to(`ride:${rideId}`).emit('ride:status:change', { rideId, status: 'RIDE_STARTED', ride: startedRide });
    io.emit('ride:status:change', { rideId, status: 'RIDE_STARTED', ride: startedRide });

    // Step to destination over 6 iterations
    for (let i = 1; i <= 6; i++) {
      await delay(1200);
      const curLat = pickupLat + (destLat - pickupLat) * (i / 6);
      const curLng = pickupLng + (destLng - pickupLng) * (i / 6);

      io.to(`ride:${rideId}`).emit('driver:location:update', {
        driverId,
        latitude: curLat,
        longitude: curLng,
        timestamp: new Date()
      });
      io.emit('driver:location:update', { driverId, latitude: curLat, longitude: curLng });
    }

    // Mark completed
    await delay(1000);
    const completedRide = await prisma.ride.update({
      where: { id: rideId },
      data: { status: 'COMPLETED', finalFare: ride.estimatedFare, paymentStatus: 'SUCCESS', completedAt: new Date() },
      include: { passenger: { select: { id: true, name: true, phone: true } }, driver: { include: { user: { select: { name: true, phone: true } }, vehicle: true } } }
    });

    await prisma.driver.update({
      where: { id: driverId },
      data: { totalRides: { increment: 1 }, totalEarnings: { increment: ride.estimatedFare } }
    });

    io.to(`ride:${rideId}`).emit('ride:status:change', { rideId, status: 'COMPLETED', ride: completedRide });
    io.emit('ride:status:change', { rideId, status: 'COMPLETED', ride: completedRide });
  } catch (err) {
    console.error('Ride simulation error:', err);
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
