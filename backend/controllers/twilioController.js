import twilio from 'twilio';
import Appointment from '../models/Appointment.js';
import { v4 as uuidv4 } from 'uuid';

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

// Twilio identity: only [a-zA-Z0-9_\-\.] allowed, max 121 chars.
// Emails contain '@' and names may contain spaces — both cause error 53000.
const sanitizeIdentity = (raw = '') =>
    raw.replace(/[^a-zA-Z0-9_\-\.]/g, '_').slice(0, 121);

// Check if Twilio credentials are real (not placeholders)
const hasTwilioCredentials = () => {
    const sid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
    const key = (process.env.TWILIO_API_KEY || '').trim();
    const secret = (process.env.TWILIO_API_SECRET || '').trim();
    const appSid = (process.env.TWILIO_TWIML_APP_SID || '').trim();

    const valid = (
        sid.startsWith('AC') && sid.length === 34 && !sid.includes('XXX') &&
        key.startsWith('SK') && key.length === 34 && !key.includes('XXX') &&
        secret.length > 10 && !secret.includes('your_') &&
        appSid.startsWith('AP') && appSid.length === 34
    );
    if (!valid) {
        console.warn('[Twilio] Credential check failed:',
            `SID len=${sid.length}`, `KEY len=${key.length}`,
            `SECRET len=${secret.length}`, `APPSID len=${appSid.length}`
        );
    }
    return valid;
};

// Startup diagnostic
console.log('[Twilio] Credentials configured:', hasTwilioCredentials());

export const generateVoiceToken = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const user = req.user;

        if (!hasTwilioCredentials()) {
            return res.status(503).json({
                message: 'Voice calling is not configured. Please add Twilio credentials to .env.'
            });
        }

        // Populate both doctor and patient so we can build sanitized identities for both
        const appointment = await Appointment.findById(appointmentId)
            .populate('doctor', 'fullName email')
            .populate('patient', 'fullName email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Auth check — only the doctor or patient of this appointment can join
        const userId = user._id.toString();
        const doctorId = appointment.doctor._id.toString();
        const patientId = appointment.patient._id.toString();

        if (doctorId !== userId && patientId !== userId) {
            return res.status(403).json({ message: 'Unauthorized to join this consultation' });
        }

        // Time validation: allow 15 min before → 60 min after
        // IMPORTANT: appointment.date is stored as UTC midnight for a given calendar date.
        // appointment.timeSlot (e.g. "10:30") is in IST (the user's local timezone).
        // On the Render server (UTC), setHours() would apply hours in UTC — 5h30m off from IST.
        // Fix: Extract the YYYY-MM-DD from the stored date in UTC, then treat the timeSlot as IST
        // by subtracting the IST offset (330 min) to get the correct UTC epoch.
        const storedDate = new Date(appointment.date);
        // Get the calendar date as stored (UTC date parts represent the booked date in IST)
        const yyyy = storedDate.getUTCFullYear();
        const mm = String(storedDate.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(storedDate.getUTCDate()).padStart(2, '0');
        const [slotHours, slotMinutes] = appointment.timeSlot.split(':').map(Number);
        // Build a Date object: combine date + timeSlot as if it's IST, then convert to UTC
        // IST = UTC+05:30, so UTC = IST - 330 minutes
        const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 330 minutes in ms
        const appointmentISTMs = Date.UTC(yyyy, parseInt(mm) - 1, parseInt(dd), slotHours, slotMinutes, 0, 0);
        const appointmentUTCMs = appointmentISTMs - IST_OFFSET_MS;
        const diff = (Date.now() - appointmentUTCMs) / (1000 * 60);
        if (diff < -15 || diff > 60) {
            return res.status(400).json({
                message: 'Consultation can only be started within the scheduled time window (15 min before to 60 min after).'
            });
        }

        // Build sanitized Twilio identities for BOTH participants
        const doctorRaw = appointment.doctor.fullName || appointment.doctor.email || doctorId;
        const patientRaw = appointment.patient.fullName || appointment.patient.email || patientId;
        const doctorIdent = sanitizeIdentity(doctorRaw);
        const patientIdent = sanitizeIdentity(patientRaw);

        // Determine caller identity and peer identity
        const isDoctor = doctorId === userId;
        const myIdentity = isDoctor ? doctorIdent : patientIdent;
        const peerIdentity = isDoctor ? patientIdent : doctorIdent;

        console.log(`[Twilio Token] caller="${myIdentity}" | peer="${peerIdentity}" | role=${user.role}`);

        // Build Access Token
        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID.trim(),
            process.env.TWILIO_API_KEY.trim(),
            process.env.TWILIO_API_SECRET.trim(),
            { identity: myIdentity, ttl: 3600 }
        );
        token.addGrant(new VoiceGrant({
            outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID.trim(),
            incomingAllow: true,  // ← MUST be true to receive incoming calls
        }));

        // Set appointment consultation details on first join
        if (!appointment.consultationId) {
            appointment.consultationId = uuidv4();
            appointment.roomName = `CareSync-${doctorId}-${patientId}-${appointmentId}`;
            appointment.consultationStatus = 'in-progress';
            await appointment.save();
        }

        res.json({
            token: token.toJwt(),
            identity: myIdentity,   // who I am — my Device will register with this
            peerIdentity,                 // who to call / who will call me
            consultationId: appointment.consultationId,
            roomName: appointment.roomName,
        });

    } catch (error) {
        console.error('[Twilio Token] Error:', error.message);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
