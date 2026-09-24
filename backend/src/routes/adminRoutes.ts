import { Router } from 'express';
import {
  getAdminMetrics,
  getFareConfigs,
  updateFareConfig,
  getUsers
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/metrics', getAdminMetrics);
router.get('/fare-configs', getFareConfigs);
router.post('/fare-configs', updateFareConfig);
router.get('/users', getUsers);

export default router;
