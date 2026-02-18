import Appointment from '../models/Appointment.js';

export const saveConsultationSummary = async (req, res) => {
    try {
        const { appointmentId, notes, duration, status } = req.body;
        const user = req.user;

        // Only doctors can save summaries
        if (user.role !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can save consultation summaries' });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.doctor.toString() !== user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        appointment.consultationNotes = notes;
        appointment.duration = duration;
        appointment.consultationStatus = status || 'completed';
        appointment.status = 'completed'; // Update general appointment status too

        await appointment.save();

        res.json({ message: 'Consultation summary saved successfully' });

    } catch (error) {
        console.error('Error saving consultation summary:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const uploadPrescription = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const user = req.user;

        if (user.role !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can upload prescriptions' });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.doctor.toString() !== user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Assuming file is uploaded using multer and path is available
        appointment.prescriptionUrl = `/uploads/prescriptions/${req.file.filename}`;
        await appointment.save();

        res.json({
            message: 'Prescription uploaded successfully',
            prescriptionUrl: appointment.prescriptionUrl
        });

    } catch (error) {
        console.error('Error uploading prescription:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
