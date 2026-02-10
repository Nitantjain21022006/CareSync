import express from 'express';
import { register, login, logout, getMe, getDoctors, getPatients } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.get('/doctors', protect, getDoctors);
router.get('/patients', protect, authorize('doctor'), getPatients);

export default router;
