import twilio from 'twilio';
import Appointment from '../models/Appointment.js';
import { v4 as uuidv4 } from 'uuid';

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export const generateVoiceToken = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const user = req.user; // From auth middleware

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Validate identity - Only doctor or patient of this appointment can join
        if (appointment.doctor.toString() !== user.id && appointment.patient.toString() !== user.id) {
            return res.status(403).json({ message: 'Unauthorized to join this consultation' });
        }

        // Time Validation (15 min window)
        const appointmentDate = new Date(appointment.date);
        const [hours, minutes] = appointment.timeSlot.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0);

        const now = new Date();
        const diff = (now - appointmentDate) / (1000 * 60); // diff in minutes

        if (diff < -15 || diff > 60) { // Allowed 15 mins before to 60 mins after start
            return res.status(400).json({ message: 'Consultation can only be started within the scheduled time window' });
        }

        // Generate Twilio Token
        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET,
            { identity: user.name || user.email }
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
            identity: user.name || user.email
        });

    } catch (error) {
        console.error('Error generating Twilio token:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
