import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
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
    recordType: {
        type: String,
        enum: ['prescription', 'report', 'note', 'lab_result'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    fileUrl: String, // Cloud URL or path
    accessibleBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
