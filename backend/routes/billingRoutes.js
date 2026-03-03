import express from 'express';
import {
    createBill,
    processPayment,
    stripeWebhook,
    getAllBills,
    getPatientBills,
    downloadReceipt
} from '../controllers/billingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('hospital_staff', 'admin'), createBill);
router.get('/', protect, authorize('hospital_staff', 'admin'), getAllBills);
router.get('/patient', protect, authorize('patient'), getPatientBills);
router.get('/:id/pdf', protect, authorize('patient', 'hospital_staff', 'admin'), downloadReceipt);
router.post('/:id/pay', protect, authorize('patient'), processPayment);

export default router;
