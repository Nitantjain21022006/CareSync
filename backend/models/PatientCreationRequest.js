import mongoose from 'mongoose';

const patientCreationRequestSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientEmail: {
        type: String,
        required: true
    },
    patientFullName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    initialNotes: {
        type: String
    }
}, {
    timestamps: true
});

const PatientCreationRequest = mongoose.model('PatientCreationRequest', patientCreationRequestSchema);
export default PatientCreationRequest;
