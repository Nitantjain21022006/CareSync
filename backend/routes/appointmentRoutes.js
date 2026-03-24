import express from 'express';
import {
    getPatientUpcomingAppointments,
    bookAppointment,
    getDoctorAppointments,
    getDoctorTodayAppointments,
    getDoctorStats,
    getPatientStats,
    getStaffStats,
    getPendingAppointments,
    getStaffTodayAppointments,
    getPatientAppointmentHistory,
    updateAppointmentStatus,
    requestReschedule,
    respondReschedule,
    deleteAppointment
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/book', protect, authorize('patient'), bookAppointment);
router.get('/patient/upcoming', protect, authorize('patient'), getPatientUpcomingAppointments);
router.get('/patient/history', protect, authorize('patient'), getPatientAppointmentHistory);
router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.get('/doctor/today', protect, authorize('doctor'), getDoctorTodayAppointments);
router.get('/doctor/stats', protect, authorize('doctor'), getDoctorStats);
router.get('/patient/stats', protect, authorize('patient'), getPatientStats);
router.get('/staff/stats', protect, authorize('hospital_staff'), getStaffStats);
router.get('/staff/pending', protect, authorize('hospital_staff'), getPendingAppointments);
router.get('/staff/today', protect, authorize('hospital_staff'), getStaffTodayAppointments);
router.patch('/update-status/:id', protect, authorize('hospital_staff', 'admin', 'doctor'), updateAppointmentStatus);
router.patch('/request-reschedule/:id', protect, authorize('patient'), requestReschedule);
router.patch('/respond-reschedule/:id', protect, authorize('doctor'), respondReschedule);
router.delete('/:id', protect, authorize('doctor', 'admin'), deleteAppointment);

export default router;
