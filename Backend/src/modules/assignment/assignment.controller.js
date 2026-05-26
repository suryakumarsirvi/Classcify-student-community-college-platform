import assignmentService from './assignment.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, course, dueDate } = req.body;
  const teacherId = req.user._id || req.user.id;
  const assignment = await assignmentService.createAssignment(title, description, course, dueDate, teacherId);
  res.status(201).json({ success: true, assignment });
});

export const getAssignments = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user._id || req.user.id;
  const assignments = await assignmentService.getAssignments(userRole, userId);
  res.status(200).json({ success: true, assignments });
});
