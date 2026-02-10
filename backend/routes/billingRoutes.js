import express from 'express';
import {
    createBill,
    processPayment,
    stripeWebhook,
    getAllBills
} from '../controllers/billingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('hospital_staff', 'admin'), createBill);
router.get('/', protect, authorize('hospital_staff', 'admin'), getAllBills);
router.post('/:id/pay', protect, authorize('patient'), processPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
