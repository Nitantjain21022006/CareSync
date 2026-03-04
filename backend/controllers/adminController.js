import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Bill from '../models/Bill.js';
import AuthLog from '../models/AuthLog.js';

// @desc    Get system-wide stats for admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getSystemStats = async (req, res) => {
    try {
        const doctorCount = await User.countDocuments({ role: 'doctor' });
        const patientCount = await User.countDocuments({ role: 'patient' });
        const staffCount = await User.countDocuments({ role: 'hospital_staff' });
        const appointmentCount = await Appointment.countDocuments();

        // Calculate total revenue from paid bills
        const revenueResult = await Bill.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Calculate an activity score based on recent appointments (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentAppointments = await Appointment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const activityScore = Math.min(100, Math.round((recentAppointments / 20) * 100)) + '%';

        // Fetch recent system events
        const recentEvents = await AuthLog.find()
            .populate('userId', 'fullName role')
            .sort('-createdAt')
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                totalDoctors: doctorCount,
                totalPatients: patientCount,
                totalStaff: staffCount,
                appointmentCount,
                totalRevenue,
                departments: 8,
                systemUptime: "99.98%",
                activityScore,
                recentEvents
            }
        });
    } catch (err) {
        console.error('Get system stats error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get healthcare analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getHealthcareAnalytics = async (req, res) => {
    try {
        const { period = 'weekly' } = req.query;
        const now = new Date();
        let startDate = new Date();

        if (period === 'daily') {
            startDate.setHours(0, 0, 0, 0);
        } else {
            // Default to weekly
            startDate.setDate(now.getDate() - 7);
        }

        // 1. Revenue Analytics (Daily/Weekly)
        const revenueData = await Bill.aggregate([
            { $match: { status: 'paid', paidDate: { $gte: startDate } } },
            {
                $group: {
                    _id: period === 'daily'
                        ? { $hour: '$paidDate' }
                        : { $dayOfWeek: '$paidDate' },
                    amount: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // 2. Case Status Distribution
        const caseData = await Appointment.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const outcomeData = await Appointment.aggregate([
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$status", "completed"] },
                            then: "successful",
                            else: {
                                $cond: {
                                    if: { $in: ["$status", ["cancelled", "no-show"]] },
                                    then: "rejected",
                                    else: "other"
                                }
                            }
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const caseSummary = { active: 0, resolved: 0, cancelled: 0 };
        caseData.forEach(item => {
            if (['pending', 'scheduled', 'checked-in', 'waiting', 'in-progress'].includes(item._id)) caseSummary.active += item.count;
            else if (['completed', 'billed', 'paid'].includes(item._id)) caseSummary.resolved += item.count;
            else if (item._id === 'cancelled') caseSummary.cancelled += item.count;
        });

        const outcomeSummary = { successful: 0, rejected: 0 };
        outcomeData.forEach(item => {
            if (item._id === 'successful') outcomeSummary.successful = item.count;
            if (item._id === 'rejected') outcomeSummary.rejected = item.count;
        });

        res.status(200).json({
            success: true,
            data: {
                revenue: revenueData,
                cases: caseSummary,
                outcomes: outcomeSummary
            }
        });
    } catch (err) {
        console.error('Get analytics error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get pending doctor verifications
// @route   GET /api/admin/verifications/pending
// @access  Private (Admin)
export const getPendingVerifications = async (req, res) => {
    try {
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

// @desc    Get all users (for management with pagination)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const { role, searchTerm } = req.query;

        let query = {};
        if (role && role !== 'all') {
            query.role = role;
        }

        if (searchTerm) {
            query.$or = [
                { fullName: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            data: users
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Provision a new user
// @route   POST /api/admin/users/provision
// @access  Private (Admin)
export const provisionUser = async (req, res) => {
    try {
        const { fullName, email, password, role, phone } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            role,
            phone,
            isVerified: true, // Admin-provisioned accounts are pre-verified
            metadata: role === 'doctor' ? { isVerified: true } : {}
        });

        res.status(201).json({ success: true, data: user });
    } catch (err) {
        console.error('Provision user error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update user status (deactivate/activate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.isVerified = isActive; // Using isVerified as active/inactive for now, or you could add 'status' field
        await user.save();

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get system audit logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
export const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuthLog.find().populate('userId', 'fullName role email').sort('-createdAt').limit(100);
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
