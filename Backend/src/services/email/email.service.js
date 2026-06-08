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

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (err) {
      console.warn("⚠️ Email invitation delivery failed. Developer bypass enabled.");
      console.error("Email service error:", err.message);
      return { success: true, messageId: "dev-bypass-id", error: err.message };
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

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (err) {
      console.warn("⚠️ Email OTP delivery failed. Developer bypass enabled. OTP is:", otp);
      console.error("Email service error:", err.message);
      return { success: true, messageId: "dev-bypass-id", error: err.message };
    }
  }
}

export default new EmailService();
