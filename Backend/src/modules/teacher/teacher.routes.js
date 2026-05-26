import express from 'express';
import auth from '../../middlewares/auth.middleware.js';
import { otpRateLimiter } from '../../middlewares/rateLimit.middleware.js';
import {
  saveDraft,
  sendOTPController,
  verifyOTP,
  getDraft,
  getTeachers,
  deleteTeacher,
  updateTeacher,
  teacherLogin,
  getTeacherCourses,
  getTeacherProfile,
  getClassroomStudents,
  sendInvitationEmail
} from './teacher.controller.js';

const router = express.Router();

router.post('/draft', saveDraft);
router.post('/send-otp', otpRateLimiter, sendOTPController);
router.post('/verify', verifyOTP);
router.get('/draft/:draftId', getDraft);
router.get('/', getTeachers);
router.delete('/:id', deleteTeacher);
router.put('/:id', updateTeacher);
router.post('/send-invitation', sendInvitationEmail);
router.post('/login', teacherLogin);

router.get('/courses', auth(['teacher']), getTeacherCourses);
router.get('/profile', auth(['teacher']), getTeacherProfile);
router.get('/classroom/:classroom/students', auth(['teacher']), getClassroomStudents);

export default router;
