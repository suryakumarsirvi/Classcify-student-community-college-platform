import express from 'express';
import auth from '../../middlewares/auth.middleware.js';
import { createAssignment, getAssignments } from './assignment.controller.js';

const router = express.Router();

router.post('/', auth(['admin', 'teacher']), createAssignment);
router.get('/', auth(['admin', 'teacher', 'student']), getAssignments);

export default router;
