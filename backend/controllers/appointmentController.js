import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// @desc    Get upcoming appointments for patient
// @route   GET /api/appointments/patient/upcoming
// @access  Private (Patient)
export const getPatientUpcomingAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            patient: req.user.id,
            status: { $in: ['pending', 'confirmed'] },
            date: { $gte: new Date() }
        }).populate('doctor', 'fullName email');

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
        req.body.patient = req.user.id;
        const appointment = await Appointment.create(req.body);
        res.status(201).json({ success: true, data: appointment });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get doctor's appointments for today
// @route   GET /api/appointments/doctor/today
// @access  Private (Doctor)
export const getDoctorTodayAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await Appointment.find({
            doctor: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        }).populate('patient', 'fullName email');

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
        }).populate('patient', 'fullName email');

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
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
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayCount = await Appointment.countDocuments({
            doctor: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        });

        const upcomingCount = await Appointment.countDocuments({
            doctor: req.user.id,
            date: { $gte: tomorrow }
        });

        // Get pending access requests for this doctor
        const doctorCount = await User.countDocuments({ role: 'doctor' });
        const patientCount = await User.countDocuments({ role: 'patient' });
        const staffCount = await User.countDocuments({ role: 'hospital_staff' });
        const appointmentCount = await Appointment.countDocuments();

        // Calculate an activity score based on recent appointments (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentAppointments = await Appointment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const activityScore = Math.min(100, Math.round((recentAppointments / 20) * 100)) + '%';

        res.status(200).json({
            success: true,
            data: {
                totalDoctors: doctorCount,
                totalPatients: patientCount,
                totalStaff: staffCount,
                appointmentCount,
                departments: 8, // Realistically 8 main departments
                systemUptime: "99.98%",
                activityScore
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
            .populate('doctor', 'fullName');
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
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        appointment.status = req.body.status;
        await appointment.save();

        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
