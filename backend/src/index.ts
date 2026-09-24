import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ENV } from './config/env';
import { setupSocketHandlers } from './sockets/rideSocket';

import authRoutes from './routes/authRoutes';
import rideRoutes from './routes/rideRoutes';
import driverRoutes from './routes/driverRoutes';
import adminRoutes from './routes/adminRoutes';
import paymentRoutes from './routes/paymentRoutes';
import ratingRoutes from './routes/ratingRoutes';

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', service: 'Urban Ride Mobility API', timestamp: new Date() });
});

// Setup Socket.IO Event Handlers
setupSocketHandlers(io);

const PORT = parseInt(ENV.PORT, 10) || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Urban Ride Mobility Backend Server running on http://localhost:${PORT}`);
});
