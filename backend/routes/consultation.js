import express from 'express';
import twilio from 'twilio';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { generateVoiceToken } from '../controllers/twilioController.js';
import { getJitsiRoom } from '../controllers/jitsiController.js';
import { saveConsultationSummary, uploadPrescription } from '../controllers/consultationController.js';
import upload from '../utils/upload.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTE — Twilio Voice Webhook (NO auth — Twilio calls this directly)
// Set this URL as the "Voice Request URL" in your Twilio TwiML App:
//   POST https://<your-ngrok>.ngrok-free.app/api/consultation/voice/webhook
// ─────────────────────────────────────────────────────────────────────────────
router.post('/voice/webhook', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const to = req.body.To; // The identity of the callee (set by the client SDK)

    if (to) {
        const dial = twiml.dial({ callerId: process.env.TWILIO_CALLER_ID || 'client:caresync' });
        dial.client(to);
    } else {
        twiml.say('No destination specified. Goodbye.');
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES — require JWT auth
// ─────────────────────────────────────────────────────────────────────────────
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
