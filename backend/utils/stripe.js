import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc Create a payment intent for billing
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (e.g., 'usd')
 * @param {Object} metadata - Optional metadata (e.g., billId, patientId)
 */
export const createPaymentIntent = async (amount, currency = 'inr', metadata = {}) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata
        });
        return paymentIntent;
    } catch (error) {
        console.error('Stripe Error:', error.message);
        throw new Error('Stripe Payment Intent creation failed');
    }
};

/**
 * @desc Create a Checkout Session for billing
 * @param {Object} bill - The bill object
 * @param {string} successUrl - URL to redirect on success
 * @param {string} cancelUrl - URL to redirect on cancel
 */
export const createCheckoutSession = async (bill, successUrl, cancelUrl) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: bill.items.map(item => ({
                price_data: {
                    currency: bill.currency || 'inr',
                    product_data: {
                        name: item.description,
                    },
                    unit_amount: Math.round(item.amount * 100), // in cents
                },
                quantity: 1,
            })),
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                billId: bill._id.toString(),
                patientId: bill.patient.toString(),
                invoiceId: bill.invoiceId
            }
        });
        return session;
    } catch (error) {
        console.error('Stripe Checkout Error:', error.message);
        throw new Error('Stripe Checkout Session creation failed');
    }
};

/**
 * @desc Verify Stripe webhook signature
 * @param {Buffer} payload - Raw request body
 * @param {string} sig - Stripe signature header
 */
export const verifyWebhook = (payload, sig) => {
    try {
        const event = stripe.webhooks.constructEvent(
            payload,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        return event;
    } catch (error) {
        console.error('Stripe Webhook Error:', error.message);
        throw new Error('Webhook Signature verification failed');
    }
};

export default stripe;
