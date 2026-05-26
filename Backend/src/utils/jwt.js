import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.config.js';

export const signToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};
