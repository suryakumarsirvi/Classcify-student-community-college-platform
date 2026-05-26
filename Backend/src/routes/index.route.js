import express from 'express';
import adminRoutes from '../modules/admin/admin.routes.js';
import teacherRoutes from '../modules/teacher/teacher.routes.js';
import studentRoutes from '../modules/student/student.routes.js';
import postRoutes from '../modules/post/post.routes.js';
import messageRoutes from '../modules/message/message.routes.js';
import timetableRoutes from '../modules/timetable/timetable.routes.js';
import assignmentRoutes from '../modules/assignment/assignment.routes.js';
import announcementRoutes from '../modules/announcement/announcement.routes.js';
import resourceRoutes from '../modules/resource/resource.routes.js';
import attendanceRoutes from '../modules/attendance/attendance.routes.js';
import assetRoutes from '../modules/asset/asset.routes.js';

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/posts', postRoutes);
router.use('/messages', messageRoutes);
router.use('/timetable', timetableRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/announcements', announcementRoutes);
router.use('/resources', resourceRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/assets', assetRoutes);

export default router;
