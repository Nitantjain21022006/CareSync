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

        // 1. Staff Check-In Requirement
        // The user requested: "if and only if ... staff marks Check-In ... before that it should not be appeared"
        if (appointment.status !== 'checked-in' && appointment.status !== 'in-progress' && appointment.status !== 'waiting') {
            return res.status(400).json({ message: 'Session can only be joined after patient has checked in at the facility.' });
        }

        // 2. Time Validation (1-hour max window as requested)
        const appointmentDate = new Date(appointment.date);
        const [hours, minutes] = appointment.timeSlot.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0);

        const now = new Date();
        const diff = (now - appointmentDate) / (1000 * 60);

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
