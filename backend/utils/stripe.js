import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc Create a payment intent for billing
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (e.g., 'usd')
 * @param {Object} metadata - Optional metadata (e.g., billId, patientId)
 */
export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
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
