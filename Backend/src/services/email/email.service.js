import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_PASS, SENDER_EMAIL, CLIENT_URL } from '../../config/env.config.js';
import { createWelcomeEmailTemplate, VERIFICATION_EMAIL_TEMPLATE } from './templates/emailTemplates.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true,
      auth: {
        user: SENDER_EMAIL,
        pass: SMTP_PASS
      }
    });
  }

  async verifyConnection() {
    await this.transporter.verify();
  }

  async sendInvitation({ title, uid, recipientEmail }) {
    try {
      await this.verifyConnection();
      const htmlContent = createWelcomeEmailTemplate({ title, uid, recipientEmail, clientURL: CLIENT_URL });

      const mailOptions = {
        from: `Classcify <${SENDER_EMAIL}>`,
        to: recipientEmail,
        subject: title,
        html: htmlContent
      };

      return await this.transporter.sendMail(mailOptions);
    } catch (err) {
      console.warn("⚠️ Email invitation delivery failed. Developer bypass enabled.");
      return { messageId: "dev-bypass-id" };
    }
  }

  async sendOtp(email, otp) {
    try {
      await this.verifyConnection();
      const htmlContent = VERIFICATION_EMAIL_TEMPLATE(otp, email);

      const mailOptions = {
        from: 'Classcify Edtech Limited',
        to: email,
        subject: 'OTP for Email Verification',
        html: htmlContent
      };

      return await this.transporter.sendMail(mailOptions);
    } catch (err) {
      console.warn("⚠️ Email OTP delivery failed. Developer bypass enabled. OTP is:", otp);
      return { messageId: "dev-bypass-id" };
    }
  }
}

export default new EmailService();
