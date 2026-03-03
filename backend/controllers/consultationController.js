import Appointment from '../models/Appointment.js';
import { generateConsultationPDF } from '../utils/pdfGenerator.js';
import { sendEmail } from '../utils/email.js';

export const saveConsultationSummary = async (req, res) => {
    try {
        const { appointmentId, notes, duration, status } = req.body;
        const user = req.user;

        // Only doctors can save summaries
        if (user.role !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can save consultation summaries' });
        }

        const appointment = await Appointment.findById(appointmentId)
            .populate('patient', 'fullName email')
            .populate('doctor', 'fullName email metadata');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.doctor._id.toString() !== user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        appointment.consultationNotes = notes;
        appointment.duration = duration;
        appointment.consultationStatus = status || 'completed';
        appointment.status = 'completed'; // Update general appointment status too
        appointment.payEnable = true; // Enable billing for staff

        await appointment.save();

        // Generate PDF and Dispatch Email to Patient
        try {
            const pdfBuffer = await generateConsultationPDF(appointment);
            const base64Pdf = pdfBuffer.toString('base64');

            const subject = 'CareSync - Your Consultation Summary';
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #2D7D6F;">Consultation Summary</h2>
                    <p>Dear ${appointment.patient.fullName},</p>
                    <p>Your tele-consultation with <strong>Dr. ${appointment.doctor.fullName}</strong> on ${new Date().toLocaleDateString()} has concluded successfully.</p>
                    <p>Attached to this email is a PDF containing the official clinical notes and records of your session.</p>
                    <p>Wishing you the best in your health journey,</p>
                    <p><em>CareSync Institutional Health Team</em></p>
                </div>
            `;

            await sendEmail(appointment.patient.email, subject, htmlContent, [
                { content: base64Pdf, name: `Consultation_Summary_${appointment._id}.pdf` }
            ]);
            console.log('Consultation Summary Email sent natively to', appointment.patient.email);
        } catch (emailErr) {
            console.error('Failed to dispatch consultation summary email:', emailErr);
            // Optionally we do not block response, just log it.
        }

        res.json({ message: 'Consultation summary saved and emailed successfully' });

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
