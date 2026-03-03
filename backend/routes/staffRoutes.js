import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
    getStaffDashboardMetrics,
    getStaffAppointments,
    checkInPatient,
    updateAppointmentStatus,
    rescheduleAppointment,
    deleteAppointment
} from '../controllers/staffController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('hospital_staff'));

router.get('/dashboard-metrics', getStaffDashboardMetrics);
router.get('/appointments', getStaffAppointments);
router.post('/checkin', checkInPatient);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.patch('/appointments/:id/reschedule', rescheduleAppointment);
router.delete('/appointments/:id', deleteAppointment);

export default router;
