import axios from 'axios';

// Brevo API configuration
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

/**
 * @desc Send a transactional email via Brevo
 * @param {string} toEmail - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email body in HTML
 * @param {Array} attachments - Optional attachments [{ content: 'base64', name: 'file.pdf' }]
 */
export const sendEmail = async (toEmail, subject, htmlContent, attachments = []) => {
    const emailData = {
        sender: {
            name: process.env.BREVO_SENDER_NAME || 'CareSync',
            email: process.env.BREVO_SENDER_EMAIL || 'noreply@caresync.com'
        },
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent
    };

    if (attachments && attachments.length > 0) {
        emailData.attachment = attachments;
    }

    try {
        const response = await axios.post(BREVO_API_URL, emailData, {
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log('Email sent successfully:', response.data.messageId);
        return response.data;
    } catch (error) {
        console.error('Brevo Error:', error.response?.data || error.message);
        throw new Error('Email sending failed');
    }
};

/**
 * @desc Send OTP for verification
 * @param {string} email - Recipient email
 * @param {string} otp - The OTP code
 */
export const sendOTPEmail = async (email, otp) => {
    const subject = 'CareSync - Your Verification Code';
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #4A90E2;">CareSync Verification</h2>
            <p>Your verification code is: <strong style="font-size: 24px; color: #000;">${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        </div>
    `;
    return await sendEmail(email, subject, htmlContent);
};
/**
 * @desc Send password reset link
 * @param {string} email - Recipient email
 * @param {string} resetUrl - The reset URL with token
 */
export const sendResetPasswordEmail = async (email, resetUrl) => {
    const subject = 'CareSync - Password Reset Request';
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #4A90E2;">Password Reset</h2>
            <p>You requested a password reset. Please click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4A90E2; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
        </div>
    `;
    return await sendEmail(email, subject, htmlContent);
};
