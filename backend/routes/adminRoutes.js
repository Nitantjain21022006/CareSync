import express from 'express';
import {
    getSystemStats,
    getPendingVerifications,
    verifyDoctor,
    getAllUsers,
    getAuditLogs,
    getHealthcareAnalytics,
    provisionUser,
    updateUserStatus,
    deleteUser
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getSystemStats);
router.get('/analytics', getHealthcareAnalytics);
router.get('/verifications/pending', getPendingVerifications);
router.put('/verify/:id', verifyDoctor);
router.get('/users', getAllUsers);
router.post('/users/provision', provisionUser);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/logs', getAuditLogs);

export default router;
