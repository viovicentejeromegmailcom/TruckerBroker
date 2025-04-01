import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  },
  debug: true, // Show debug output
  logger: true // Log information about the mail transaction
});

// Generate a random token
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// Send verification email
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  try {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const verifyUrl = `${baseUrl}/api/verify?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Account',
      text: `Welcome to LogisticsHub!\n\nThank you for registering with us. To activate your account, please click or copy the link below:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not register for an account, please ignore this email.`,
      html: `
        <html>
        <body>
          <h1>Welcome to LogisticsHub!</h1>
          <p>Thank you for registering with us. To activate your account, please click on the link below:</p>
          
          <p style="margin: 20px 0;">
            <a href="${verifyUrl}" style="background-color: #0097FB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Account
            </a>
          </p>
          
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">
            <a href="${verifyUrl}" style="color: #0097FB;">${verifyUrl}</a>
          </p>
          
          <p>This link will expire in 24 hours.</p>
          <p>If you did not register for an account, please ignore this email.</p>
        </body>
        </html>
      `
    });

    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

// Send account approval notification
export async function sendApprovalEmail(email: string, approved: boolean, message?: string): Promise<boolean> {
  try {
    const subject = approved ? 'Your Account Has Been Approved' : 'Account Registration Status';

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const loginUrl = `${baseUrl}/auth`;

    let textContent = '';
    let htmlContent = '';

    if (approved) {
      textContent = `Account Approved!\n\nYour account has been approved. You can now log in and start using our platform.\n\nLog in at: ${loginUrl}`;

      htmlContent = `
        <html>
        <body>
          <h1>Account Approved!</h1>
          <p>Your account has been approved. You can now log in and start using our platform.</p>
          
          <p><a href="${loginUrl}">Click here to log in to your account</a></p>
          
          <p>Or copy and paste this URL into your browser:</p>
          <p>${loginUrl}</p>
        </body>
        </html>
      `;
    } else {
      textContent = `Account Status Update\n\nWe have reviewed your registration and we're sorry to inform you that your account has not been approved at this time.\n\n${message ? `Reason: ${message}\n\n` : ''}If you have any questions, please contact our support team.`;

      htmlContent = `
        <html>
        <body>
          <h1>Account Status Update</h1>
          <p>We have reviewed your registration and we're sorry to inform you that your account has not been approved at this time.</p>
          
          ${message ? `<p><strong>Reason:</strong> ${message}</p>` : ''}
          
          <p>If you have any questions, please contact our support team.</p>
        </body>
        </html>
      `;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      text: textContent,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Failed to send approval email:', error);
    return false;
  }
}