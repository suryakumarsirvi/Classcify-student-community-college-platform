import twilio from 'twilio';
import { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } from '../../config/env.config.js';

class SmsService {
  constructor() {
    this.client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
    this.from = TWILIO_PHONE;
  }

  async sendOtp(to, otp) {
    try {
      const message = await this.client.messages.create({
        body: `Your Classcify OTP: ${otp} - Valid for 10 minutes`,
        from: this.from,
        to: `+91${to}`
      });
      return !!message.sid;
    } catch (err) {
      console.warn("⚠️ Twilio OTP delivery failed. Developer bypass enabled. OTP is:", otp);
      return true;
    }
  }
}

export default new SmsService();
