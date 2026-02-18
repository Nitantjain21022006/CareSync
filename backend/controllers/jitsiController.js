import Appointment from '../models/Appointment.js';

export const getJitsiRoom = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const user = req.user;

        const appointment = await Appointment.findById(appointmentId)
            .populate('doctor', 'name')
            .populate('patient', 'name');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Validate identity
        if (appointment.doctor._id.toString() !== user.id && appointment.patient._id.toString() !== user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Time Validation (15 min window)
        const appointmentDate = new Date(appointment.date);
        const [hours, minutes] = appointment.timeSlot.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0);

        const now = new Date();
        const diff = (now - appointmentDate) / (1000 * 60);

        if (diff < -15 || diff > 60) {
            return res.status(400).json({ message: 'Meeting room can only be accessed within the scheduled time window' });
        }

        // Generate/Return Room Name
        const roomName = appointment.roomName || `CareSync-${appointment.doctor._id}-${appointment.patient._id}-${appointmentId}`;

        if (!appointment.roomName) {
            appointment.roomName = roomName;
            appointment.consultationStatus = 'in-progress';
            await appointment.save();
        }

        res.json({
            roomName,
            doctorName: appointment.doctor.name,
            patientName: appointment.patient.name,
            appointmentTime: appointment.timeSlot
        });

    } catch (error) {
        console.error('Error fetching Jitsi room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
