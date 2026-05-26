import express from 'express';
import auth from '../../middlewares/auth.middleware.js';
import { createTimetable, getTimetable } from './timetable.controller.js';

const router = express.Router();

router.post('/', auth(['admin', 'teacher']), createTimetable);
router.get('/', auth(['teacher', 'student']), getTimetable);

export default router;
