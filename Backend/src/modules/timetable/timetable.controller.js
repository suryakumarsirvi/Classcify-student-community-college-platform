import timetableService from './timetable.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createTimetable = asyncHandler(async (req, res) => {
  const { subject, course, startTime, endTime } = req.body;
  const teacherId = req.user._id || req.user.id;
  const timetable = await timetableService.createTimetable(subject, course, startTime, endTime, teacherId);
  res.status(201).json({ success: true, timetable });
});

export const getTimetable = asyncHandler(async (req, res) => {
  const teacherId = req.user._id || req.user.id;
  const timetable = await timetableService.getTimetable(teacherId);
  res.status(200).json(timetable);
});
