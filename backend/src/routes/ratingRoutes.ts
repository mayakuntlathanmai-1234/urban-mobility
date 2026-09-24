import { Router } from 'express';
import { submitRating } from '../controllers/ratingController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.post('/', submitRating);

export default router;
