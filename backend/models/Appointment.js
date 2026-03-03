import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'checked-in', 'waiting', 'in-progress', 'completed', 'billed', 'paid', 'cancelled', 'no-show'],
        default: 'pending'
    },
    checkInTime: Date,
    roomAllocation: String,
    reason: String,
    notes: String,
    mlPrediction: {
        noShowProbability: Number,
        predictionDate: Date
    },
    // Consultation Fields
    consultationId: {
        type: String,
        unique: true,
        sparse: true
    },
    sessionToken: String,
    roomName: String,
    consultationStatus: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'missed'],
        default: 'pending'
    },
    duration: Number, // in minutes
    prescriptionUrl: String,
    consultationNotes: String,
    payEnable: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
