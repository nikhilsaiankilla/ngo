// ----------------------------------------
// Email Utility using Nodemailer (Gmail)
// ----------------------------------------

import nodemailer from 'nodemailer';

/**
 * Creates a reusable transporter object using the default Gmail SMTP transport.
 * Requires Gmail credentials via environment variables:
 *  - EMAIL_ID: The sender's Gmail address
 *  - EMAIL_PASSWORD: The app password or actual password (prefer app password for security)
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Sends an email using the preconfigured transporter.
 *
 * @param to - Recipient email address
 * @param subject - Subject of the email
 * @param html - HTML content of the email body
 * @returns The email response string if sent successfully
 * @throws Error if sending fails
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<string> => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_ID, // Sender address
            to,                          // List of receivers
            subject,                     // Subject line
            html                         // HTML body content
        };

        const info = await transporter.sendMail(mailOptions);
        return info.response;
    } catch (error: unknown) {
        // Improve debugging by logging the actual error (optional: use logger in production)
        console.error("Error sending email:", error);

        // Throw a clean error for the caller
        throw new Error("Failed to send email");
    }
};
