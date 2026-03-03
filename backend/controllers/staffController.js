import Appointment from '../models/Appointment.js';
import Bill from '../models/Bill.js';
import User from '../models/User.js';

export const getStaffDashboardMetrics = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointmentsToday = await Appointment.find({
            date: { $gte: today, $lt: tomorrow }
        });

        const metrics = {
            totalToday: appointmentsToday.length,
            checkedIn: appointmentsToday.filter(a => a.status === 'checked-in').length,
            waiting: appointmentsToday.filter(a => a.status === 'waiting').length,
            inProgress: appointmentsToday.filter(a => a.status === 'in-progress').length,
            completedToday: appointmentsToday.filter(a => a.status === 'completed').length,
            pendingPayments: await Bill.countDocuments({ status: 'pending' }),
            revenueToday: await Bill.aggregate([
                { $match: { status: 'paid', updatedAt: { $gte: today, $lt: tomorrow } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]).then(res => res[0]?.total || 0)
        };

        res.json(metrics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStaffAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient', 'fullName email')
            .populate('doctor', 'fullName profilePhoto')
            .sort({ date: -1, timeSlot: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const checkInPatient = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.status === 'cancelled') return res.status(400).json({ message: 'Cannot check-in cancelled appointment' });

        appointment.status = 'checked-in';
        appointment.checkInTime = new Date();
        await appointment.save();

        res.json({ message: 'Patient checked in successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, timeSlot } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(id, {
            date,
            timeSlot,
            status: 'scheduled'
        }, { new: true });

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findByIdAndDelete(id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
