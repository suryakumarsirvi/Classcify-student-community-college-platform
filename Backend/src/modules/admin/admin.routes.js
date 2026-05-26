import express from 'express';
import auth from '../../middlewares/auth.middleware.js';
import {
  getProfile,
  login,
  initAdmin,
  getDashboardStats,
  getRecentTeachers,
  getStudentAdmissions,
  getAnnouncements,
  broadcastAnnouncement,
  getAnalyticsStats,
  getAnalyticsChart,
  getReports,
  createReport,
  updateReport,
  deleteReport
} from './admin.controller.js';

const router = express.Router();

router.post('/init', initAdmin);
router.post('/login', login);
router.get('/profile', auth(['admin']), getProfile);

router.get('/dashboard/stats', getDashboardStats);
router.get('/teachers/recent', getRecentTeachers);
router.get('/students/admissions', getStudentAdmissions);
router.get('/announcements', getAnnouncements);
router.post('/broadcast', broadcastAnnouncement);

router.get('/analytics/stats', getAnalyticsStats);
router.get('/analytics/chart', getAnalyticsChart);

router.route('/analytics/reports')
  .get(getReports)
  .post(createReport);

router.route('/analytics/reports/:id')
  .put(updateReport)
  .delete(deleteReport);

export default router;
