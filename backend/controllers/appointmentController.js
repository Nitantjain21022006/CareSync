import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

// @desc    Get upcoming appointments for patient
// @route   GET /api/appointments/patient/upcoming
// @access  Private (Patient)
export const getPatientUpcomingAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const appointments = await Appointment.find({
            patient: req.user.id,
            status: { $in: ['pending', 'confirmed', 'scheduled', 'waiting', 'checked-in', 'in-progress'] },
            date: { $gte: today }
        }).populate('doctor', 'fullName email metadata');

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Book an appointment
// @route   POST /api/appointments/book
// @access  Private (Patient)
export const bookAppointment = async (req, res) => {
    try {
        const { doctor, date, timeSlot, type, reason } = req.body;
        const patientId = req.user.id;

        const appointment = await Appointment.create({
            patient: patientId,
            doctor,
            date,
            timeSlot,
            status: 'pending',
            reason: reason || (type === 'Virtual' ? 'Tele-consultation' : 'In-person Consultation')
        });

        // Notify Doctor
        const doctorUser = await User.findById(doctor);
        const patientUser = await User.findById(patientId);

        if (doctorUser && patientUser) {
            const subject = 'New Appointment Request - CareSync';
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #2D7D6F;">New Consultation Requested</h2>
                    <p><strong>Patient:</strong> ${patientUser.fullName}</p>
                    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                    <p><strong>Time Slot:</strong> ${timeSlot}</p>
                    <p>Please log in to your dashboard to confirm or reschedule this request.</p>
                    <a href="${process.env.FRONTEND_URL}/dashboard/doctor" style="background: #1A202C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
                </div>
            `;
            try {
                await sendEmail(doctorUser.email, subject, htmlContent);
            } catch (err) {
                console.error('Email notification to doctor failed');
            }
        }

        res.status(201).json({ success: true, data: appointment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get doctor's appointments for today
// @route   GET /api/appointments/doctor/today
// @access  Private (Doctor)
export const getDoctorTodayAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

        const appointments = await Appointment.find({
            doctor: req.user.id,
            date: { $gte: today, $lt: tomorrow },
            status: { $ne: 'cancelled' }
        }).populate('patient', 'fullName email metadata');

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all appointments for doctor
// @route   GET /api/appointments/doctor
// @access  Private (Doctor)
export const getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            doctor: req.user.id
        }).populate('patient', 'fullName email metadata');

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get patient dashboard stats
// @route   GET /api/appointments/patient/stats
// @access  Private (Patient)
export const getPatientStats = async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const upcomingCount = await Appointment.countDocuments({
            patient: req.user.id,
            status: { $in: ['pending', 'confirmed'] },
            date: { $gte: today }
        });

        const MedicalRecord = (await import('../models/MedicalRecord.js')).default;
        const totalRecords = await MedicalRecord.countDocuments({ patient: req.user.id });
        const activePrescriptions = await MedicalRecord.countDocuments({
            patient: req.user.id,
            recordType: 'prescription'
        });

        res.status(200).json({
            success: true,
            data: {
                upcomingAppointments: upcomingCount,
                totalRecords,
                activePrescriptions
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get doctor dashboard stats
// @route   GET /api/appointments/doctor/stats
// @access  Private (Doctor)
export const getDoctorStats = async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

        const todayCount = await Appointment.countDocuments({
            doctor: req.user.id,
            date: { $gte: today, $lt: tomorrow },
            status: { $ne: 'cancelled' }
        });

        const upcomingCount = await Appointment.countDocuments({
            doctor: req.user.id,
            date: { $gte: tomorrow },
            status: { $ne: 'cancelled' }
        });

        const consultations = await Appointment.countDocuments({
            doctor: req.user.id,
            status: 'confirmed'
        });

        // Get pending appointments count for "Pending Approvals" stat
        const pendingAppointments = await Appointment.countDocuments({
            doctor: req.user.id,
            status: 'pending'
        });

        // Get pending access requests for this doctor
        const AccessRequest = (await import('../models/AccessRequest.js')).default;
        const pendingAccessRequests = await AccessRequest.countDocuments({
            doctor: req.user.id,
            status: 'pending'
        });

        res.status(200).json({
            success: true,
            data: {
                todayPatients: todayCount,
                pendingRequests: pendingAccessRequests, // Keep for legacy if needed
                pendingAppointments,
                consultations,
                upcomingAppointments: upcomingCount
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get staff dashboard stats
// @route   GET /api/appointments/staff/stats
// @access  Private (Staff)
export const getStaffStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const pendingApprovals = await Appointment.countDocuments({ status: 'pending' });
        const checkinsToday = await Appointment.countDocuments({
            date: { $gte: today, $lt: tomorrow },
            status: 'confirmed'
        });

        // Get total billed amount from Bill model if it exists
        const Bill = (await import('../models/Bill.js')).default;
        const bills = await Bill.find({ status: 'paid' });
        const billedAmount = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                pendingApprovals,
                checkinsToday,
                billedAmount,
                activeAlerts: Math.floor(pendingApprovals / 2) // Derived from pending
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all pending appointments for staff
// @route   GET /api/appointments/staff/pending
// @access  Private (Staff)
export const getPendingAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ status: 'pending' })
            .populate('patient', 'fullName')
            .populate('doctor', 'fullName metadata');
        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all appointments for today for staff (Live Intake)
// @route   GET /api/appointments/staff/today
// @access  Private (Staff)
export const getStaffTodayAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await Appointment.find({
            date: { $gte: today, $lt: tomorrow },
            status: { $in: ['pending', 'confirmed'] }
        })
            .populate('patient', 'fullName')
            .populate('doctor', 'fullName metadata')
            .sort('timeSlot');

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
// @desc    Update appointment status
// @route   PUT /api/appointments/update-status/:id
// @access  Private (Staff/Admin)
export const updateAppointmentStatus = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'fullName email metadata')
            .populate('doctor', 'fullName email metadata');

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        // Authorization check
        if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to update this appointment' });
        }

        appointment.status = req.body.status;
        if (req.body.date) appointment.date = req.body.date;
        if (req.body.timeSlot) appointment.timeSlot = req.body.timeSlot;
        if (req.body.notes) appointment.notes = req.body.notes;

        await appointment.save();

        // Create or update DoctorPatient relationship when confirmed
        if (req.body.status === 'confirmed') {
            const DoctorPatient = (await import('../models/DoctorPatient.js')).default;
            await DoctorPatient.findOneAndUpdate(
                { doctor: appointment.doctor._id, patient: appointment.patient._id },
                { status: 'active' },
                { upsert: true, new: true }
            );

            // Notify Patient
            const subject = 'Consultation Confirmed - CareSync';
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #2D7D6F;">Consultation Confirmed</h2>
                    <p>Your appointment with <strong>Dr. ${appointment.doctor.fullName}</strong> has been confirmed.</p>
                    <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
                    <p><strong>Time Slot:</strong> ${appointment.timeSlot}</p>
                    <p>You can view the details in your patient portal.</p>
                    <a href="${process.env.FRONTEND_URL}/dashboard/patient/appointments" style="background: #1A202C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">My Appointments</a>
                </div>
            `;
            try {
                await sendEmail(appointment.patient.email, subject, htmlContent);
            } catch (err) {
                console.error('Email notification to patient failed');
            }
        }

        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
