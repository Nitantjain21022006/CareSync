import twilio from 'twilio';
import Appointment from '../models/Appointment.js';
import { v4 as uuidv4 } from 'uuid';

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

// Check if Twilio credentials are real (not placeholders)
const hasTwilioCredentials = () => {
    const sid = process.env.TWILIO_ACCOUNT_SID || '';
    const key = process.env.TWILIO_API_KEY || '';
    const secret = process.env.TWILIO_API_SECRET || '';
    return (
        sid.startsWith('AC') && sid.length === 34 && !sid.includes('XXX') &&
        key.startsWith('SK') && key.length === 34 && !key.includes('XXX') &&
        secret.length > 10 && !secret.includes('your_')
    );
};

export const generateVoiceToken = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const user = req.user; // From auth middleware

        // Guard: Twilio credentials not configured
        if (!hasTwilioCredentials()) {
            return res.status(503).json({
                message: 'Voice calling is not configured. Please add your Twilio credentials to the .env file (TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET, TWILIO_TWIML_APP_SID).'
            });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Validate identity - Only doctor or patient of this appointment can join
        const userId = user._id.toString();
        if (appointment.doctor.toString() !== userId && appointment.patient.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to join this consultation' });
        }

        // Time Validation: allow 15 mins before to 60 mins after scheduled time
        const appointmentDate = new Date(appointment.date);
        const timeParts = appointment.timeSlot.split(':');
        appointmentDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);

        const now = new Date();
        const diff = (now - appointmentDate) / (1000 * 60); // diff in minutes

        if (diff < -15 || diff > 60) {
            return res.status(400).json({
                message: 'Consultation can only be started within the scheduled time window (15 min before to 60 min after).'
            });
        }

        // Generate Twilio Access Token
        const identity = user.fullName || user.email;
        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET,
            { identity, ttl: 1800 } // 30 minute expiry
        );

        const grant = new VoiceGrant({
            outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
            incomingAllow: true,
        });
        token.addGrant(grant);

        // Update appointment with consultation details if not already present
        if (!appointment.consultationId) {
            appointment.consultationId = uuidv4();
            appointment.roomName = `CareSync-${appointment.doctor}-${appointment.patient}-${appointmentId}`;
            appointment.consultationStatus = 'in-progress';
            await appointment.save();
        }

        res.json({
            token: token.toJwt(),
            consultationId: appointment.consultationId,
            roomName: appointment.roomName,
            identity
        });

    } catch (error) {
        console.error('Error generating Twilio token:', error.message);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
