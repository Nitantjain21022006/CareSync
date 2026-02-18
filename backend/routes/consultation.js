import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { generateVoiceToken } from '../controllers/twilioController.js';
import { getJitsiRoom } from '../controllers/jitsiController.js';
import { saveConsultationSummary, uploadPrescription } from '../controllers/consultationController.js';
import upload from '../utils/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Voice Token Generation
router.post('/voice/token', generateVoiceToken);

// Video Room Generation
router.post('/video/room', getJitsiRoom);

// Consultation Summary (Doctor only)
router.post('/summary', authorize('doctor'), saveConsultationSummary);

// Prescription Upload (Doctor only)
router.post('/prescription', authorize('doctor'), upload.single('prescription'), uploadPrescription);

export default router;
