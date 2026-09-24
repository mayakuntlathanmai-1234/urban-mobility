import { Router } from 'express';
import {
  updateStatus,
  updateLocation,
  getNearbyDrivers,
  getDashboardStats
} from '../controllers/driverController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.patch('/status', updateStatus);
router.patch('/location', updateLocation);
router.get('/nearby', getNearbyDrivers);
router.get('/dashboard', getDashboardStats);

export default router;
