import express from 'express';
import auth from '../../middlewares/auth.middleware.js';
import { createAnnouncement, getAnnouncements } from './announcement.controller.js';

const router = express.Router();

router.post('/', auth(['admin', 'teacher']), createAnnouncement);
router.get('/', auth(['admin', 'teacher', 'student']), getAnnouncements);

export default router;
