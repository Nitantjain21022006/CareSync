import MedicalRecord from '../models/MedicalRecord.js';
import User from '../models/User.js';
import AccessRequest from '../models/AccessRequest.js';

// @desc    Upload/Create a medical record
// @route   POST /api/records
// @access  Private (Patient/Doctor)
export const createRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.create(req.body);
        res.status(201).json({ success: true, data: record });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all records for a patient
// @route   GET /api/records/patient/:id
// @access  Private (Patient/Authorized Doctor)
export const getPatientRecords = async (req, res) => {
    try {
        const patientId = req.params.patientId || req.user.id;

        // If not the patient, check if doctor is authorized
        if (req.user.role === 'doctor' && req.user.id !== patientId) {
            const record = await MedicalRecord.findOne({
                patient: patientId,
                accessibleBy: req.user.id
            });
            if (!record) {
                return res.status(403).json({ success: false, error: 'Not authorized to view these records' });
            }
        }

        const records = await MedicalRecord.find({ patient: patientId }).populate('doctor', 'fullName');
        res.status(200).json({ success: true, count: records.length, data: records });
    } catch (err) {
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
        const records = await MedicalRecord.find({ patient: req.user.id });
        const doctorIds = [...new Set(records.flatMap(r => r.accessibleBy))];
        const doctors = await User.find({ _id: { $in: doctorIds } }).select('fullName email metadata');
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
        const records = await MedicalRecord.find({ accessibleBy: req.user.id });
        const patientIds = [...new Set(records.map(r => r.patient.toString()))];
        const patients = await User.find({ _id: { $in: patientIds } }).select('fullName email phone metadata');
        res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
