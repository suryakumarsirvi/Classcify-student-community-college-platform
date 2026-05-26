import express from 'express';
import auth from '../../middlewares/auth.middleware.js';
import {
  markAttendance,
  getAttendance,
  getAttendanceStats,
  updateAttendance,
  getStudentAttendance,
  getAttendanceHeatmap,
  getStudentDetailedStats
} from './attendance.controller.js';

const router = express.Router();

router.post('/', auth(['teacher']), markAttendance);
router.get('/', auth(['teacher', 'student']), getAttendance);
router.get('/stats', auth(['teacher']), getAttendanceStats);
router.put('/:attendanceId', auth(['teacher']), updateAttendance);
router.get('/student', auth(['teacher', 'student']), getStudentAttendance);
router.get('/heatmap/:studentId', auth(['teacher', 'student']), getAttendanceHeatmap);
router.get('/mystats', auth(['student']), getStudentDetailedStats);

export default router;
