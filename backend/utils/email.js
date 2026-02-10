import * as SibApiV3Sdk from '@getbrevo/brevo';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Configure API key authorization
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

/**
 * @desc Send a transactional email via Brevo
 * @param {string} toEmail - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email body in HTML
 */
export const sendEmail = async (toEmail, subject, htmlContent) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
        name: process.env.BREVO_SENDER_NAME || 'CareSync',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@caresync.com'
    };
    sendSmtpEmail.to = [{ email: toEmail }];

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully:', data.messageId);
        return data;
    } catch (error) {
        console.error('Brevo Error:', error.response?.body || error.message);
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
