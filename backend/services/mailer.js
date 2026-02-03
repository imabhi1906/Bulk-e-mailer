import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Creates and returns a nodemailer transporter configured for Gmail SMTP
 */
export function createTransporter() {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP credentials not configured. Please set SMTP_EMAIL and SMTP_PASSWORD in .env');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Sends a single email
 * @param {Object} transporter - nodemailer transporter
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email body
 * @param {Array} options.attachments - Optional attachments
 * @returns {Promise<Object>} - Result object with success status
 */
export async function sendEmail(transporter, { to, subject, text, attachments = [] }) {
  try {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to,
      subject,
      text,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      to,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      to,
    };
  }
}
