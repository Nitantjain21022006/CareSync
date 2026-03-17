import Appointment from '../models/Appointment.js';

export const getJitsiRoom = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const user = req.user;

        const appointment = await Appointment.findById(appointmentId)
            .populate('doctor', 'fullName')
            .populate('patient', 'fullName');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Validate identity
        if (appointment.doctor._id.toString() !== user.id && appointment.patient._id.toString() !== user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // 1. Staff Check-In Requirement (Bypassed for Doctors)
        // Doctors can start the session manually. Patients still need check-in or the doctor to be present (in-progress).
        if (user.role === 'patient') {
            if (appointment.status !== 'checked-in' && appointment.status !== 'in-progress' && appointment.status !== 'waiting') {
                return res.status(400).json({ message: 'Session can only be joined after patient has checked in at the facility.' });
            }
        }

        // 2. Time Validation (1-hour max window as requested)
        // IMPORTANT: appointment.date is stored as UTC midnight for a given calendar date.
        // appointment.timeSlot (e.g. "10:30") is in IST (the user's local timezone).
        // On the Render server (UTC), setHours() would apply hours in UTC — 5h30m off from IST.
        // Fix: Extract UTC date parts and combine with timeSlot as IST, then convert to UTC.
        const storedDate = new Date(appointment.date);
        const yyyy = storedDate.getUTCFullYear();
        const mm = storedDate.getUTCMonth(); // 0-indexed
        const dd = storedDate.getUTCDate();
        const [slotHours, slotMinutes] = appointment.timeSlot.split(':').map(Number);
        // IST = UTC+05:30, so appointmentUTC = appointmentIST - 330min
        const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
        const appointmentISTMs = Date.UTC(yyyy, mm, dd, slotHours, slotMinutes, 0, 0);
        const appointmentUTCMs = appointmentISTMs - IST_OFFSET_MS;

        const now = new Date();
        const diff = (now.getTime() - appointmentUTCMs) / (1000 * 60);

        // Window: 15 mins before to 60 mins after
        if (diff < -15 || diff > 60) {
            return res.status(400).json({ message: 'Meeting room can only be accessed within 1 hour of the scheduled time.' });
        }

        // Generate/Return Room Name
        const roomName = appointment.roomName || `CareSync-${appointment.doctor._id}-${appointment.patient._id}-${appointmentId}`;

        if (!appointment.roomName || appointment.status !== 'in-progress') {
            appointment.roomName = roomName;
            appointment.status = 'in-progress'; // Sync appointment status
            appointment.consultationStatus = 'in-progress';
            await appointment.save();
        }

        res.json({
            roomName,
            doctorName: appointment.doctor.fullName,
            patientName: appointment.patient.fullName,
            appointmentTime: appointment.timeSlot
        });

    } catch (error) {
        console.error('Error fetching Jitsi room:', error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};
