import Bill from '../models/Bill.js';
import Appointment from '../models/Appointment.js';
import { createPaymentIntent, createCheckoutSession, verifyWebhook } from '../utils/stripe.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';
import { generateReceiptPDF } from '../utils/pdfGenerator.js';

// @desc    Create a bill for a patient
// @route   POST /api/billing
// @access  Private (Hospital Staff/Admin)
export const createBill = async (req, res) => {
    try {
        const { patient, appointmentId, items, description } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });

        // Strict Rule: ONLY after status = "Completed"
        if (appointment.status !== 'completed' && appointment.status !== 'in-progress') {
            // Allowing in-progress just in case staff bills while patient is still with doctor, 
            // but user request said "ONLY after status = Completed"
            // I will stick to "completed" to be strict as per prompt.
            if (appointment.status !== 'completed') {
                return res.status(400).json({ success: false, error: 'Cannot generate invoice for incomplete appointment' });
            }
        }

        // Check for duplicate invoice
        const existingBill = await Bill.findOne({ appointment: appointmentId });
        if (existingBill) return res.status(400).json({ success: false, error: 'Invoice already exists for this appointment' });

        let patientId = patient;
        if (typeof patient === 'string' && patient.includes('@')) {
            const user = await User.findOne({ email: patient });
            if (!user) return res.status(404).json({ success: false, error: 'Patient not found' });
            patientId = user._id;
        }

        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
        const invoiceId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const bill = await Bill.create({
            invoiceId,
            patient: patientId,
            appointment: appointmentId,
            items,
            totalAmount,
            description,
            createdByStaff: req.user.id
        });

        // Update appointment status to "Billed"
        appointment.status = 'billed';
        await appointment.save();

        res.status(201).json({ success: true, data: bill });
    } catch (err) {
        console.error('Create bill error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Generate Stripe Checkout Session for a bill
export const processPayment = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) return res.status(404).json({ success: false, error: 'Bill not found' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const session = await createCheckoutSession(
            bill,
            `${frontendUrl}/dashboard/patient/billing?success=true&billId=${bill._id}`,
            `${frontendUrl}/dashboard/patient/billing?canceled=true`
        );

        bill.stripePaymentIntentId = session.id; // Store session ID
        await bill.save();

        res.status(200).json({
            success: true,
            url: session.url,
            bill
        });
    } catch (err) {
        console.error('Process payment error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};



// @desc    Webhook to handle payment success
export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = verifyWebhook(req.body, sig);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle both payment_intent AND checkout.session
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
        const sessionOrIntent = event.data.object;
        const { billId } = sessionOrIntent.metadata || {};

        if (!billId) {
            console.log('Skipping webhook, no billId in metadata');
            return res.json({ received: true });
        }

        const bill = await Bill.findById(billId)
            .populate('patient')
            .populate({
                path: 'appointment',
                populate: { path: 'doctor' }
            });

        if (bill && bill.status !== 'paid') {
            bill.status = 'paid';
            bill.paidDate = new Date();
            await bill.save();

            // 1. Sync Appointment Status
            if (bill.appointment) {
                await Appointment.findByIdAndUpdate(bill.appointment._id, { status: 'paid' });

                // 2. Generate Receipt PDF
                try {
                    const pdfBuffer = await generateReceiptPDF(bill, bill.appointment);
                    const base64Pdf = pdfBuffer.toString('base64');

                    // 3. Email Patient with PDF
                    const patientSubject = `Receipt for Appointment #${bill.invoiceId}`;
                    const patientHtml = `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Thank you for your payment</h2>
                            <p>Hi ${bill.patient.fullName},</p>
                            <p>Your payment for appointment on ${new Date(bill.appointment.date).toLocaleDateString()} has been received.</p>
                            <p>Please find your official medical receipt attached to this email.</p>
                            <br/>
                            <p>Team CareSync</p>
                        </div>
                    `;
                    await sendEmail(bill.patient.email, patientSubject, patientHtml, [
                        { content: base64Pdf, name: `Receipt_${bill.invoiceId}.pdf` }
                    ]);

                    // 4. Email Doctor with Summary Notification
                    const doctorSubject = `Consultation Finalized & Paid: ${bill.patient.fullName}`;
                    const doctorHtml = `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Consultation Payment Confirmed</h2>
                            <p>Hi Dr. ${bill.appointment.doctor.fullName},</p>
                            <p>Payment for your consultation with <strong>${bill.patient.fullName}</strong> has been successfully processed.</p>
                            <hr/>
                            <h3>Consultation Notes:</h3>
                            <p>${bill.appointment.consultationNotes || 'No notes provided'}</p>
                            <p>Duration: ${bill.appointment.duration || 0} minutes</p>
                            <br/>
                            <p>The record is now marked as complete in the financial system.</p>
                        </div>
                    `;
                    await sendEmail(bill.appointment.doctor.email, doctorSubject, doctorHtml);

                } catch (pdfError) {
                    console.error('Post-payment automation failed:', pdfError);
                }
            }
        }
    }

    res.json({ received: true });
};

// @desc    Get all bills (for staff/admin)
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

// @desc    Get bills for logged-in patient
// @route   GET /api/billing/patient
// @access  Private (Patient)
export const getPatientBills = async (req, res) => {
    try {
        const bills = await Bill.find({ patient: req.user._id })
            .populate({
                path: 'appointment',
                populate: { path: 'doctor', select: 'fullName email specialization' }
            })
            .populate('createdByStaff', 'fullName email')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: bills.length, data: bills });
    } catch (err) {
        console.error('Get patient bills error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Download receipt PDF
// @route   GET /api/billing/:id/pdf
// @access  Private (Patient/Staff/Admin)
export const downloadReceipt = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('patient', 'fullName email')
            .populate({
                path: 'appointment',
                populate: { path: 'doctor', select: 'fullName metadata' }
            });

        if (!bill) {
            return res.status(404).json({ success: false, error: 'Bill not found' });
        }

        // Ensure the logged-in user is either admin/staff or the patient themselves
        if (req.user.role === 'patient' && bill.patient._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to access this receipt' });
        }

        // Ensure paid
        if (bill.status !== 'paid') {
            return res.status(400).json({ success: false, error: 'Cannot download receipt for unpaid bill' });
        }

        const pdfBuffer = await generateReceiptPDF(bill, bill.appointment);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Receipt_${bill.invoiceId}.pdf`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);
    } catch (err) {
        console.error('Download receipt error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
