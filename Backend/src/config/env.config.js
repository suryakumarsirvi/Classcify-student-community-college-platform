import 'dotenv/config';

const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_INITIAL_PASSWORD',
  'TWILIO_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE',
  'SMTP_HOST',
  'SMTP_PASS',
  'CORS_ORIGIN',
  'CLIENT_URL',
  'SENDER_EMAIL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missing = [];

REQUIRED_ENV_VARS.forEach((key) => {
  if (!process.env[key] || process.env[key].trim() === '') {
    missing.push(key);
  }
});

if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  missing.push('MONGO_URI or MONGODB_URI');
}

if (missing.length > 0) {
  console.error('Missing required environment variables:');
  missing.forEach((key) => console.error(`  - ${key}`));
  process.exit(1);
}

const env = Object.freeze({
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI,
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.CLIENT_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_INITIAL_PASSWORD: process.env.ADMIN_INITIAL_PASSWORD,
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  TWILIO_SID: process.env.TWILIO_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE: process.env.TWILIO_PHONE,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '465', 10),
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PASS: process.env.SMTP_PASS,
  SENDER_EMAIL: process.env.SENDER_EMAIL,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
});

export default env;
export const {
  MONGO_URI,
  CORS_ORIGIN,
  JWT_SECRET,
  ADMIN_EMAIL,
  ADMIN_INITIAL_PASSWORD,
  PORT,
  NODE_ENV,
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE,
  SMTP_PORT,
  SMTP_HOST,
  SMTP_PASS,
  SENDER_EMAIL,
  CLIENT_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
} = env;
