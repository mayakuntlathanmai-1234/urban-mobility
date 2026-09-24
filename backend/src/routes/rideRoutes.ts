import { Router } from 'express';
import {
  estimateFare,
  createRide,
  acceptRide,
  markArrived,
  startRide,
  completeRide,
  cancelRide,
  getRide,
  listRides
} from '../controllers/rideController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/estimate', estimateFare);
router.post('/', createRide);
router.get('/', listRides);
router.get('/:id', getRide);

router.post('/:id/accept', acceptRide);
router.post('/:id/arrive', markArrived);
router.post('/:id/start', startRide);
router.post('/:id/complete', completeRide);
router.post('/:id/cancel', cancelRide);

export default router;
