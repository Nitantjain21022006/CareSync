import express from 'express';
import twilio from 'twilio';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { generateVoiceToken } from '../controllers/twilioController.js';
import { getJitsiRoom } from '../controllers/jitsiController.js';
import { saveConsultationSummary, uploadPrescription } from '../controllers/consultationController.js';
import upload from '../utils/upload.js';

const router = express.Router();

// ─── DIAGNOSTIC: GET /api/consultation/voice/debug ────────────────────────────
router.get('/voice/debug', (req, res) => {
    const sid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
    const key = (process.env.TWILIO_API_KEY || '').trim();
    const secret = (process.env.TWILIO_API_SECRET || '').trim();
    const appSid = (process.env.TWILIO_TWIML_APP_SID || '').trim();
    const caller = (process.env.TWILIO_CALLER_ID || '').trim();
    res.json({
        msg: 'Twilio env vars (masked)',
        ACCOUNT_SID: `${sid.slice(0, 6)}... len=${sid.length} valid=${sid.startsWith('AC') && sid.length === 34}`,
        API_KEY: `${key.slice(0, 6)}... len=${key.length} valid=${key.startsWith('SK') && key.length === 34}`,
        API_SECRET: `len=${secret.length} valid=${secret.length > 10}`,
        TWIML_APP_SID: `${appSid.slice(0, 6)}... len=${appSid.length} valid=${appSid.startsWith('AP') && appSid.length === 34}`,
        CALLER_ID: caller || '(not set)',
    });
});

// ─── DIAGNOSTIC: GET /api/consultation/voice/webhook ──────────────────────────
router.get('/voice/webhook', (req, res) => {
    res.json({
        status: 'REACHABLE',
        note: 'Twilio calls this as POST. If you can see this JSON, your route path is correct.',
        setInTwilioConsole: `POST https://${req.get('host')}/api/consultation/voice/webhook`,
    });
});

// ─── PUBLIC — Twilio Voice Webhook (no auth — Twilio POSTs here on every call) ─
// Set this as Voice Request URL in Twilio Console → TwiML Apps
router.post('/voice/webhook', (req, res) => {
    console.log('\n🔔 [Twilio Webhook] HIT — POST /api/consultation/voice/webhook');
    console.log('🔔 [Twilio Webhook] Body:', JSON.stringify(req.body, null, 2));

    const twiml = new twilio.twiml.VoiceResponse();
    const to = req.body.To;    // peer's client identity (e.g. "Patient_Name")
    const from = req.body.From;  // caller's identity      (e.g. "client:Doctor_Name")

    // For browser-to-browser calls the callerId must be EITHER:
    //   1. A Twilio-purchased/verified phone number, OR
    //   2. The caller's own "client:<identity>"
    // Using an unverified phone number here causes Twilio to ring that PSTN number!
    // We use the caller's own client identity — no Twilio phone number required.
    const callerId = from || 'client:caresync';

    console.log(`🔔 [Twilio Webhook] From="${from}" | To="${to}" | callerId="${callerId}"`);

    if (to) {
        const dial = twiml.dial({ callerId });
        dial.client(to);
    } else {
        console.warn('⚠️  [Twilio Webhook] No "To" in body — saying goodbye.');
        twiml.say('No destination specified. Goodbye.');
    }

    const xmlResponse = twiml.toString();
    console.log('🔔 [Twilio Webhook] TwiML:', xmlResponse);
    res.type('text/xml');
    res.send(xmlResponse);
});

// ─── PROTECTED — require JWT auth for everything below ────────────────────────
router.use(protect);

// Voice Token (caller gets their identity + peer identity)
router.post('/voice/token', (req, res, next) => {
    console.log('\n🎟️  [Twilio Token] HIT — POST /api/consultation/voice/token');
    console.log('🎟️  [Twilio Token] Body:', JSON.stringify(req.body, null, 2));
    console.log('🎟️  [Twilio Token] User:', req.user?._id, '|', req.user?.role);
    next();
}, generateVoiceToken);

// Video Room
router.post('/video/room', getJitsiRoom);

// Consultation Summary (Doctor only)
router.post('/summary', authorize('doctor'), saveConsultationSummary);

// Prescription Upload (Doctor only)
router.post('/prescription', authorize('doctor'), upload.single('prescription'), uploadPrescription);

export default router;
