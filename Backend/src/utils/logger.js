import { NODE_ENV } from '../config/env.config.js';

const logger = {
  info: (message, meta = {}) => {
    if (NODE_ENV !== 'production') {
      console.log(`[INFO] ${message}`, Object.keys(meta).length ? meta : '');
    } else {
      console.log(JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString(), ...meta }));
    }
  },
  error: (message, error = {}, meta = {}) => {
    const errorDetails = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error;
    if (NODE_ENV !== 'production') {
      console.error(`[ERROR] ${message}`, errorDetails, Object.keys(meta).length ? meta : '');
    } else {
      console.error(JSON.stringify({ level: 'error', message, error: errorDetails, timestamp: new Date().toISOString(), ...meta }));
    }
  },
  warn: (message, meta = {}) => {
    if (NODE_ENV !== 'production') {
      console.warn(`[WARN] ${message}`, Object.keys(meta).length ? meta : '');
    } else {
      console.warn(JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString(), ...meta }));
    }
  },
  debug: (message, meta = {}) => {
    if (NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${message}`, Object.keys(meta).length ? meta : '');
    } else {
      console.log(JSON.stringify({ level: 'debug', message, timestamp: new Date().toISOString(), ...meta }));
    }
  }
};

export default logger;
