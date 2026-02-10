import Bill from '../models/Bill.js';
import Appointment from '../models/Appointment.js';
import { createPaymentIntent } from '../utils/stripe.js';

// @desc    Create a bill for a patient
// @route   POST /api/billing
// @access  Private (Hospital Staff/Admin)
export const createBill = async (req, res) => {
    try {
        const { patient, appointmentId, amount } = req.body;

        const bill = await Bill.create({
            patient,
            appointment: appointmentId,
            amount
        });

        res.status(201).json({ success: true, data: bill });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Generate Stripe Payment Intent for a bill
// @route   POST /api/billing/:id/pay
// @access  Private (Patient)
export const processPayment = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ success: false, error: 'Bill not found' });
        }

        const paymentIntent = await createPaymentIntent(
            bill.amount * 100, // cents
            bill.currency,
            { billId: bill._id.toString(), patientId: req.user.id }
        );

        bill.stripePaymentIntentId = paymentIntent.id;
        await bill.save();

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            bill
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Webhook to handle payment success
// @route   POST /api/billing/webhook
// @access  Public (Stripe Webhook)
export const stripeWebhook = async (req, res) => {
    // Logic for webhook verification and updating bill status
    // (Actual implementation would require raw body buffer)
    res.status(200).json({ received: true });
};

// @desc    Get all bills (for staff/admin)
// @route   GET /api/billing
// @access  Private (Hospital Staff/Admin)
export const getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find()
            .populate('patient', 'fullName email')
            .populate('appointment', 'date timeSlot')
            .sort('-createdAt');
        res.status(200).json({ success: true, count: bills.length, data: bills });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
