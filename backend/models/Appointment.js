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
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
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
    consultationNotes: String
}, {
    timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
