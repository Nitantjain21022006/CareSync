import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
    invoiceId: {
        type: String,
        unique: true,
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    items: [{
        description: { type: String, required: true },
        amount: { type: Number, required: true }
    }],
    currency: {
        type: String,
        default: 'inr'
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    createdByStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
