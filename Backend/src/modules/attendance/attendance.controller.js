import attendanceService from './attendance.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const markAttendance = asyncHandler(async (req, res) => {
  const { course, students, date } = req.body;
  const teacherId = req.user._id || req.user.id;
  const attendance = await attendanceService.markAttendance(course, students, date, teacherId);
  res.status(201).json({ success: true, attendance });
});

export const getAttendance = asyncHandler(async (req, res) => {
  const { course, date } = req.query;
  const attendance = await attendanceService.getAttendance(course, date);
  res.json({ success: true, attendance });
});

export const getAttendanceStats = asyncHandler(async (req, res) => {
  const { course, startDate, endDate } = req.query;
  const stats = await attendanceService.getAttendanceStats(course, startDate, endDate);
  res.json({ success: true, ...stats });
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;
  const { students } = req.body;
  const attendance = await attendanceService.updateAttendance(attendanceId, students);
  res.json({ success: true, attendance });
});

export const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId, course, startDate, endDate } = req.query;
  const result = await attendanceService.getStudentAttendance(studentId, course, startDate, endDate);
  res.json({ success: true, ...result });
});

export const getAttendanceHeatmap = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { classroom } = req.query;
  const heatmapData = await attendanceService.getAttendanceHeatmap(studentId, classroom);
  res.json({ success: true, data: heatmapData });
});

export const getStudentDetailedStats = asyncHandler(async (req, res) => {
  const studentId = req.user._id || req.user.id;
  const result = await attendanceService.getStudentDetailedStats(studentId);
  res.json({ success: true, ...result });
});
