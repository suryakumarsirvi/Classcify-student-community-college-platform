import timetableService from './timetable.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createTimetable = asyncHandler(async (req, res) => {
  const { subject, course, startTime, endTime } = req.body;
  const teacherId = req.user._id || req.user.id;
  const timetable = await timetableService.createTimetable(subject, course, startTime, endTime, teacherId);
  res.status(201).json({ success: true, timetable });
});

export const getTimetable = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const role = req.user.role;
  let timetable;
  if (role === 'student') {
    timetable = await timetableService.getStudentTimetable(req.user);
  } else {
    timetable = await timetableService.getTimetable(userId);
  }
  res.status(200).json(timetable);
});
