import express from 'express';
import { register, login, logout, getMe, getDoctors, getPatients, updateProfile, addDoctor, uploadProfilePhoto, forgotPassword, resetPassword, requestSignupOTP } from '../controllers/authController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.post('/signup', register);
router.post('/request-signup-otp', requestSignupOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/profile-photo', protect, upload.single('photo'), uploadProfilePhoto);
router.post('/add-doctor', protect, authorize('patient'), addDoctor);
router.get('/doctors', protect, getDoctors);
router.get('/patients', protect, authorize('doctor'), getPatients);

export default router;
