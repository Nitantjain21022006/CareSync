import express from 'express';
import {
    getSystemStats,
    getPendingVerifications,
    verifyDoctor,
    getAllUsers,
    getAuditLogs
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getSystemStats);
router.get('/verifications/pending', protect, authorize('admin'), getPendingVerifications);
router.put('/verify/:id', protect, authorize('admin'), verifyDoctor);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/logs', protect, authorize('admin'), getAuditLogs);

export default router;
