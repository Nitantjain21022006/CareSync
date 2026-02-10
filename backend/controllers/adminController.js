import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// @desc    Get system-wide stats for admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getSystemStats = async (req, res) => {
    try {
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
                departments: 8,
                systemUptime: "99.98%",
                activityScore
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get pending doctor verifications
// @route   GET /api/admin/verifications/pending
// @access  Private (Admin)
export const getPendingVerifications = async (req, res) => {
    try {
        // Assuming doctor metadata has a verification status
        // For now, let's just find all doctors and filter (you might add a 'isVerified' field later)
        const doctors = await User.find({
            role: 'doctor',
            'metadata.isVerified': false
        });
        res.status(200).json({ success: true, count: doctors.length, data: doctors });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Verify a doctor
// @route   PUT /api/admin/verify/:id
// @access  Private (Admin)
export const verifyDoctor = async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, error: 'Doctor not found' });
        }

        doctor.metadata = { ...doctor.metadata, isVerified: req.body.isVerified };
        await doctor.save();

        res.status(200).json({ success: true, data: doctor });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all users (for management)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get system audit logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
export const getAuditLogs = async (req, res) => {
    try {
        const AuthLog = (await import('../models/AuthLog.js')).default;
        const logs = await AuthLog.find().populate('userId', 'fullName role email').sort('-createdAt').limit(100);
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
