import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema({
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
    action: {
        type: String,
        enum: ['GRANTED', 'REVOKED', 'REQUESTED', 'APPROVED', 'REJECTED'],
        required: true
    },
    type: {
        type: String,
        enum: ['RECORDS_ACCESS', 'CLINICAL_INITIATION'],
        required: true
    },
    reason: String,
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

// Index for performance
accessLogSchema.index({ patient: 1, createdAt: -1 });

const AccessLog = mongoose.model('AccessLog', accessLogSchema);
export default AccessLog;
