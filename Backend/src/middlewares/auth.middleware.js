import jwt from 'jsonwebtoken';
import Admin from '../database/models/admin.model.js';
import Teacher from '../database/models/teacher.model.js';
import Student from '../database/models/student.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { JWT_SECRET } from '../config/env.config.js';

const auth = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id);
    } else if (decoded.role === 'teacher') {
      user = await Teacher.findById(decoded.id).select('+auth.password');
    } else if (decoded.role === 'student') {
      user = await Student.findById(decoded.id);
    }

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const userRole = decoded.role || (user.role ? user.role.toLowerCase() : 'student');

    if (roles.length > 0 && !roles.includes(userRole)) {
      throw new ApiError(403, 'Forbidden: Insufficient permissions');
    }

    req.user = user;
    req.token = token;
    req.user.role = userRole;

    next();
  });
};

export default auth;
