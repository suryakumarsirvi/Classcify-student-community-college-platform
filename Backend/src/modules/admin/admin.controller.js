import adminService from './admin.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await adminService.getProfile(req.user._id);
  res.json(profile);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await adminService.login(email, password);
  res.json(result);
});

export const initAdmin = asyncHandler(async (req, res) => {
  await adminService.initAdmin();
  res.status(201).json({ message: 'Admin created successfully' });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.json(stats);
});

export const getRecentTeachers = asyncHandler(async (req, res) => {
  const teachers = await adminService.getRecentTeachers();
  res.json(teachers);
});

export const getStudentAdmissions = asyncHandler(async (req, res) => {
  const admissions = await adminService.getAdmissionsStats();
  res.json(admissions);
});

export const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await adminService.getRecentAnnouncements();
  res.json(announcements);
});

export const broadcastAnnouncement = asyncHandler(async (req, res) => {
  const { message, audience } = req.body;
  await adminService.broadcastAnnouncement(message, audience);
  res.status(201).json({
    success: true,
    message: 'Broadcast sent successfully'
  });
});

export const getAnalyticsStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getAnalyticsStats();
  res.json(stats);
});

export const getAnalyticsChart = asyncHandler(async (req, res) => {
  const chartData = await adminService.getAnalyticsChartData();
  res.json(chartData);
});

export const getReports = asyncHandler(async (req, res) => {
  const reports = await adminService.getAllReports();
  res.json(reports);
});

export const createReport = asyncHandler(async (req, res) => {
  const report = await adminService.createReport(req.body);
  res.status(201).json(report);
});

export const updateReport = asyncHandler(async (req, res) => {
  const report = await adminService.updateReport(req.params.id, req.body);
  res.json(report);
});

export const deleteReport = asyncHandler(async (req, res) => {
  await adminService.deleteReport(req.params.id);
  res.json({ success: true });
});
