import mongoose from 'mongoose';

const doctorPatientSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Ensure unique pairs
doctorPatientSchema.index({ doctor: 1, patient: 1 }, { unique: true });

const DoctorPatient = mongoose.model('DoctorPatient', doctorPatientSchema);
export default DoctorPatient;
