import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { MONGO_URI, ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD } from '../config/env.config.js';
import adminService from '../modules/admin/admin.service.js';
import { comparePassword } from '../utils/bcrypt.js';
import Admin from './models/admin.model.js';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(MONGO_URI);
    logger.info(`MongoDB connected to host: ${connectionInstance.connection.host}`);
    
    // Auto-seed the initial admin on startup
    try {
      const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });
      if (existingAdmin) {
        const isMatch = await comparePassword(ADMIN_INITIAL_PASSWORD, existingAdmin.password);
        if (!isMatch) {
          logger.warn('Default Admin credentials mismatched (possibly double-hashed). Re-creating admin user...');
          await Admin.deleteOne({ _id: existingAdmin._id });
        }
      }
      
      await adminService.initAdmin();
      logger.info('Default Admin user initialized successfully');
    } catch (err) {
      if (err.statusCode === 400 && err.message === 'Admin already exists') {
        logger.info('Default Admin user already exists');
      } else {
        logger.error('Failed to initialize default admin user', err);
      }
    }
  } catch (error) {
    logger.error('MongoDB connection failure', error);
    process.exit(1);
  }
};

export default connectDB;
