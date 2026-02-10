import mongoose from 'mongoose';

const accessRequestSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    record: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reason: String // Reason for requesting access
}, {
    timestamps: true
});

const AccessRequest = mongoose.model('AccessRequest', accessRequestSchema);
export default AccessRequest;
