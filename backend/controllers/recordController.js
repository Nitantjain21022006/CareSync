import MedicalRecord from '../models/MedicalRecord.js';
import User from '../models/User.js';
import AccessRequest from '../models/AccessRequest.js';
import DoctorPatient from '../models/DoctorPatient.js';
import PatientCreationRequest from '../models/PatientCreationRequest.js';
import fs from 'fs';
import path from 'path';

// @desc    Upload/Create a medical record
// @route   POST /api/records
// @access  Private (Patient/Doctor)
export const createRecord = async (req, res) => {
    try {
        const { patient, doctor, recordType, title, description, fileUrl } = req.body;

        // 1. Validation for Patients
        if (req.user.role === 'patient') {
            // Patient can only upload for themselves
            // If they pass an ID, it must be their own. If not, we set it.
            const targetPatientId = patient && patient !== 'me' ? patient : req.user.id;
            if (targetPatientId !== req.user.id) {
                return res.status(403).json({ success: false, error: 'Unauthorized: Patients can only upload for themselves.' });
            }

            let finalFileUrl = fileUrl;
            if (req.file) {
                finalFileUrl = `uploads/${req.file.filename}`;
            }

            const record = await MedicalRecord.create({
                patient: req.user.id,
                doctor: doctor, // Optional: Which doctor is this record for?
                recordType,
                title,
                description,
                fileUrl: finalFileUrl,
                accessibleBy: doctor ? [doctor] : [] // Automatically allow that doctor if specified
            });
            return res.status(201).json({ success: true, data: record });
        }

        // 2. Validation for Doctors
        if (req.user.role === 'doctor') {
            if (!patient) {
                return res.status(400).json({ success: false, error: 'Please provide a patient ID.' });
            }

            // Check if doctor is authorized for this patient
            const isAuthorized = await DoctorPatient.findOne({
                doctor: req.user.id,
                patient: patient,
                status: 'active'
            });

            if (!isAuthorized) {
                return res.status(403).json({ success: false, error: 'Unauthorized: You are not authorized to upload for this patient.' });
            }

            let finalFileUrl = fileUrl;
            if (req.file) {
                finalFileUrl = `uploads/${req.file.filename}`;
            }

            const record = await MedicalRecord.create({
                patient,
                doctor: req.user.id,
                recordType,
                title,
                description,
                fileUrl: finalFileUrl,
                accessibleBy: [req.user.id] // Doctor who created it obviously has access
            });
            return res.status(201).json({ success: true, data: record });
        }

        res.status(403).json({ success: false, error: 'Unauthorized role.' });
    } catch (err) {
        console.error('Create Record Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all records for a patient
// @route   GET /api/records/patient/:id
// @access  Private (Patient/Authorized Doctor)
export const getPatientRecords = async (req, res) => {
    try {
        const patientId = req.params.patientId;

        // If not the patient themselves, check authorization
        if (req.user.id !== patientId) {
            if (req.user.role === 'doctor') {
                const isAuthorized = await DoctorPatient.findOne({
                    doctor: req.user.id,
                    patient: patientId,
                    status: 'active'
                });
                if (!isAuthorized) {
                    return res.status(403).json({ success: false, error: 'Not authorized to view these records' });
                }
            } else {
                return res.status(403).json({ success: false, error: 'Unauthorized access.' });
            }
        }

        const records = await MedicalRecord.find({ patient: patientId }).populate('doctor', 'fullName');
        res.status(200).json({ success: true, count: records.length, data: records });
    } catch (err) {
        console.error('Get Patient Records Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Grant access to a doctor
// @route   POST /api/access/grant
// @access  Private (Patient)
export const grantAccess = async (req, res) => {
    try {
        const { doctorId } = req.body;
        // Update all patient records to include this doctor in accessibleBy
        await MedicalRecord.updateMany(
            { patient: req.user.id },
            { $addToSet: { accessibleBy: doctorId } }
        );
        res.status(200).json({ success: true, message: 'Access granted' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Revoke access from a doctor
// @route   POST /api/access/revoke
// @access  Private (Patient)
export const revokeAccess = async (req, res) => {
    try {
        const { doctorId } = req.body;
        await MedicalRecord.updateMany(
            { patient: req.user.id },
            { $pull: { accessibleBy: doctorId } }
        );
        res.status(200).json({ success: true, message: 'Access revoked' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get my own medical records
// @route   GET /api/records/patient/me
// @access  Private (Patient)
export const getMyRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find({ patient: req.user.id }).populate('doctor', 'fullName');
        res.status(200).json({ success: true, count: records.length, data: records });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete a medical record
// @route   DELETE /api/records/:id
// @access  Private (Patient/Authorized Doctor)
export const deleteRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }

        // Check ownership
        // Only the patient who owns it or the doctor who created it can delete it
        const isOwner = record.patient.toString() === req.user.id;
        const isCreatorDoctor = record.doctor.toString() === req.user.id;

        if (!isOwner && !isCreatorDoctor) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this record' });
        }

        // Delete physical file if exists
        if (record.fileUrl) {
            const filePath = path.join(process.cwd(), record.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await record.deleteOne();

        res.status(200).json({ success: true, message: 'Record deleted successfully' });
    } catch (err) {
        console.error('Delete Record Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update a medical record
// @route   PUT /api/records/:id
// @access  Private (Patient/Authorized Doctor)
export const updateRecord = async (req, res) => {
    try {
        const { title, recordType, description } = req.body;
        const record = await MedicalRecord.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }

        // Check ownership
        const isOwner = record.patient.toString() === req.user.id;
        const isCreatorDoctor = record.doctor.toString() === req.user.id;

        if (!isOwner && !isCreatorDoctor) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this record' });
        }

        record.title = title || record.title;
        record.recordType = recordType || record.recordType;
        record.description = description || record.description;

        await record.save();

        res.status(200).json({ success: true, data: record });
    } catch (err) {
        console.error('Update Record Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Request access to patient records
// @route   POST /api/records/access/request
// @access  Private (Doctor)
export const createAccessRequest = async (req, res) => {
    try {
        const { patientId, reason } = req.body;
        const request = await AccessRequest.create({
            doctor: req.user.id,
            patient: patientId,
            reason
        });
        res.status(201).json({ success: true, data: request });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get pending access requests for doctor
// @route   GET /api/records/access/requests/pending
// @access  Private (Doctor)
export const getPendingAccessRequests = async (req, res) => {
    try {
        const requests = await AccessRequest.find({
            doctor: req.user.id,
            status: 'pending'
        }).populate('patient', 'fullName');
        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all doctors authorized to view patient records
// @route   GET /api/records/access/authorized
// @access  Private (Patient)
export const getAuthorizedDoctors = async (req, res) => {
    try {
        const links = await DoctorPatient.find({ patient: req.user.id, status: 'active' }).populate('doctor', 'fullName email metadata');
        const doctors = links.map(link => link.doctor);
        res.status(200).json({ success: true, count: doctors.length, data: doctors });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all patients authorized for this doctor
// @route   GET /api/records/access/authorized-patients
// @access  Private (Doctor)
export const getAuthorizedPatients = async (req, res) => {
    try {
        const links = await DoctorPatient.find({ doctor: req.user.id, status: 'active' }).populate('patient', 'fullName email phone metadata');
        const patients = links.map(link => link.patient);
        res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Doctor initiates a patient creation request
// @route   POST /api/records/creation-request
// @access  Private (Doctor)
export const createPatientCreationRequest = async (req, res) => {
    try {
        const { patientEmail, patientFullName, initialNotes } = req.body;

        // Check if there's already a pending request for this email from this doctor
        const existing = await PatientCreationRequest.findOne({
            doctor: req.user.id,
            patientEmail,
            status: 'pending'
        });

        if (existing) {
            return res.status(400).json({ success: false, error: 'A pending request already exists for this patient.' });
        }

        const request = await PatientCreationRequest.create({
            doctor: req.user.id,
            patientEmail,
            patientFullName,
            initialNotes
        });

        res.status(201).json({ success: true, data: request });
    } catch (err) {
        console.error('Create Patient Creation Request Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get pending creation requests for a patient
// @route   GET /api/records/creation-requests/pending
// @access  Private (Patient)
export const getPendingCreationRequestsForPatient = async (req, res) => {
    try {
        const requests = await PatientCreationRequest.find({
            patientEmail: req.user.email,
            status: 'pending'
        }).populate('doctor', 'fullName');

        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all creation requests sent by a doctor
// @route   GET /api/records/doctor/creation-requests
// @access  Private (Doctor)
export const getDoctorCreationRequests = async (req, res) => {
    try {
        const requests = await PatientCreationRequest.find({
            doctor: req.user.id
        });
        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Patient responds to creation request
// @route   PATCH /api/records/creation-request/:requestId
// @access  Private (Patient)
export const respondToCreationRequest = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const requestId = req.params.requestId;

        const request = await PatientCreationRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        if (request.patientEmail !== req.user.email) {
            return res.status(403).json({ success: false, error: 'Not authorized to respond to this request' });
        }

        request.status = status;
        await request.save();

        if (status === 'approved') {
            // Find patient user by email
            const patientUser = await User.findOne({ email: request.patientEmail });
            if (!patientUser) {
                return res.status(404).json({ success: false, error: 'Patient user not found' });
            }

            // Create DoctorPatient link
            await DoctorPatient.create({
                doctor: request.doctor,
                patient: patientUser._id,
                status: 'active'
            });

            // Update patient metadata with initial notes if any
            if (request.initialNotes) {
                patientUser.metadata = {
                    ...patientUser.metadata,
                    practitionerNotes: (patientUser.metadata.practitionerNotes || '') + '\n' + request.initialNotes
                };
                await patientUser.save();
            }
        }

        res.status(200).json({ success: true, data: request });
    } catch (err) {
        console.error('Respond to Creation Request Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Share a consultation with another doctor
// @route   POST /api/records/share-consultation
// @access  Private (Doctor)
export const shareConsultation = async (req, res) => {
    try {
        const { patientId, targetDoctorId, summary } = req.body;

        // Check if doctor is authorized for this patient
        const isAuthorized = await DoctorPatient.findOne({
            doctor: req.user.id,
            patient: patientId,
            status: 'active'
        });

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'Unauthorized: You are not authorized for this patient.' });
        }

        const record = await MedicalRecord.create({
            patient: patientId,
            doctor: req.user.id,
            recordType: 'consultation',
            title: `Consultation Sharing: ${req.user.fullName}`,
            description: summary,
            accessibleBy: [req.user.id, targetDoctorId]
        });

        res.status(201).json({ success: true, data: record });
    } catch (err) {
        console.error('Share Consultation Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get shared consultations for a doctor
// @route   GET /api/records/shared-consultations
// @access  Private (Doctor)
export const getSharedConsultations = async (req, res) => {
    try {
        const consultations = await MedicalRecord.find({
            recordType: 'consultation',
            accessibleBy: req.user.id
        }).populate('patient', 'fullName').populate('doctor', 'fullName');

        res.status(200).json({ success: true, count: consultations.length, data: consultations });
    } catch (err) {
        console.error('Get Shared Consultations Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get pending access requests for a patient
// @route   GET /api/records/patient/access-requests
// @access  Private (Patient)
export const getPatientAccessRequests = async (req, res) => {
    try {
        const requests = await AccessRequest.find({
            patient: req.user.id,
            status: 'pending'
        }).populate('doctor', 'fullName email metadata');

        res.status(200).json({ success: true, data: requests });
    } catch (err) {
        console.error('Get Patient Access Requests Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Respond to access request (Approve/Reject)
// @route   PATCH /api/records/patient/access-request/:requestId
// @access  Private (Patient)
export const respondToAccessRequest = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const { requestId } = req.params;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const request = await AccessRequest.findOne({
            _id: requestId,
            patient: req.user.id
        });

        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        request.status = status;
        await request.save();

        if (status === 'approved') {
            // Create or update DoctorPatient relationship
            await DoctorPatient.findOneAndUpdate(
                { doctor: request.doctor, patient: request.patient },
                { status: 'active' },
                { upsert: true, new: true }
            );

            // Grant access to all existing records
            await MedicalRecord.updateMany(
                { patient: request.patient },
                { $addToSet: { accessibleBy: request.doctor } }
            );
        }

        res.status(200).json({ success: true, data: request });
    } catch (err) {
        console.error('Respond to Access Request Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all access logs for a patient (history)
// @route   GET /api/records/patient/access-logs
// @access  Private (Patient)
export const getPatientAccessLogs = async (req, res) => {
    try {
        const [accessRequests, creationRequests] = await Promise.all([
            AccessRequest.find({ patient: req.user.id }).populate('doctor', 'fullName email metadata'),
            PatientCreationRequest.find({ patientEmail: req.user.email }).populate('doctor', 'fullName email metadata')
        ]);

        res.status(200).json({
            success: true,
            data: {
                accessRequests,
                creationRequests
            }
        });
    } catch (err) {
        console.error('Get Patient Access Logs Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update patient vitals (metadata)
// @route   PATCH /api/records/patient/:patientId/vitals
// @access  Private (Doctor)
export const updatePatientVitals = async (req, res) => {
    try {
        const { weight, bp } = req.body;
        const patientId = req.params.patientId;

        // Verify doctor authorization
        const isAuthorized = await DoctorPatient.findOne({
            doctor: req.user.id,
            patient: patientId,
            status: 'active'
        });

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'No clinical authorization for this patient' });
        }

        const patient = await User.findById(patientId);
        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }

        patient.metadata = {
            ...patient.metadata,
            weight: weight || patient.metadata.weight,
            bp: bp || patient.metadata.bp
        };

        await patient.save();

        res.status(200).json({ success: true, data: patient.metadata });
    } catch (err) {
        console.error('Update Patient Vitals Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get authorized doctors for a specific patient (for collaboration)
// @route   GET /api/records/patient/:patientId/authorized-doctors
// @access  Private (Doctor)
export const getPatientAuthorizedDoctors = async (req, res) => {
    try {
        const patientId = req.params.patientId;

        // Ensure the requesting doctor is authorized for this patient
        const selfAuth = await DoctorPatient.findOne({
            doctor: req.user.id,
            patient: patientId,
            status: 'active'
        });

        if (!selfAuth) {
            return res.status(403).json({ success: false, error: 'Authorization required for collaboration sync' });
        }

        const authorizations = await DoctorPatient.find({
            patient: patientId,
            status: 'active'
        }).populate('doctor', 'fullName email metadata');

        res.status(200).json({ success: true, data: authorizations.map(a => a.doctor) });
    } catch (err) {
        console.error('Get Patient Authorized Doctors Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

