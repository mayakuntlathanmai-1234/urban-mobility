import { Router } from 'express';
import { processPayment } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.post('/process', processPayment);

export default router;
