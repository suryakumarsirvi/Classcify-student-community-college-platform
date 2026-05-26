import express from 'express';
import auth from '../../middlewares/auth.middleware.js';
import {
  signup,
  verify,
  login,
  getProfile,
  getAllStudents,
  searchUsers,
  getAssignments,
  getAnnouncements,
  getInvitations,
  getStudentTimetable
} from './student.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify/:id', verify);
router.post('/login', login);

router.get('/profile', auth(['student']), getProfile);
router.get('/', auth(['admin', 'teacher', 'student']), getAllStudents);
router.get('/search', auth(['student', 'teacher', 'admin']), searchUsers);

router.get('/assignments', auth(['student']), getAssignments);
router.get('/announcements', auth(['student']), getAnnouncements);
router.get('/invitations', auth(['student']), getInvitations);
router.get('/timetable', auth(['student']), getStudentTimetable);

export default router;
