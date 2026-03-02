import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    currency: {
        type: String,
        default: 'usd'
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    stripePaymentIntentId: String,
    billingDate: {
        type: Date,
        default: Date.now
    },
    paidDate: Date
}, {
    timestamps: true
});

const Bill = mongoose.model('Bill', billSchema);
export default Bill;
