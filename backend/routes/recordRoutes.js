import express from 'express';
import {
    createRecord,
    getPatientRecords,
    grantAccess,
    revokeAccess,
    getMyRecords,
    createAccessRequest,
    getPendingAccessRequests,
    getAuthorizedDoctors,
    getAuthorizedPatients,
    createPatientCreationRequest,
    getPendingCreationRequestsForPatient,
    respondToCreationRequest
} from '../controllers/recordController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRecord);
router.get('/patient/:patientId', protect, getPatientRecords);
router.get('/patient/me', protect, authorize('patient'), getMyRecords);
router.post('/access/request', protect, authorize('doctor'), createAccessRequest);
router.get('/access/requests/pending', protect, authorize('doctor'), getPendingAccessRequests);
router.post('/access/grant', protect, authorize('patient'), grantAccess);
router.post('/access/revoke', protect, authorize('patient'), revokeAccess);
router.get('/access/authorized', protect, authorize('patient'), getAuthorizedDoctors);
router.get('/access/authorized-patients', protect, authorize('doctor'), getAuthorizedPatients);

// Patient Creation Requests
router.post('/creation-request', protect, authorize('doctor'), createPatientCreationRequest);
router.get('/creation-requests/pending', protect, authorize('patient'), getPendingCreationRequestsForPatient);
router.patch('/creation-request/:requestId', protect, authorize('patient'), respondToCreationRequest);

export default router;
