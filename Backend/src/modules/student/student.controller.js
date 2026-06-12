import studentService from './student.service.js';
import Timetable from '../../database/models/timetable.model.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

export const signup = asyncHandler(async (req, res) => {
  const { personal, academic, other, auth } = req.body;
  const student = await studentService.signup(personal, academic, other, auth);
  res.status(201).json({
    message: 'Student registered. Check email for OTP.',
    studentId: student._id
  });
});

export const verify = asyncHandler(async (req, res) => {
  const studentId = req.params.id;
  const { otp } = req.body;
  const token = await studentService.verify(studentId, otp);
  res.json({ message: 'Email verified successfully', token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body.personal ? { email: req.body.personal.email, password: req.body.auth?.password } : { email: req.body.email, password: req.body.password };
  const result = await studentService.login(email, password);
  res.json(result);
});

export const getProfile = asyncHandler(async (req, res) => {
  const student = await studentService.getProfile(req.user._id);
  res.json(student);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const student = await studentService.updateProfile(req.user._id, req.body);
  res.json(student);
});

export const getAllStudents = asyncHandler(async (req, res) => {
  const students = await studentService.getAllStudents();
  res.json(students);
});

export const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query.q;
  if (!query) {
    throw new ApiError(400, 'Search query required');
  }
  const users = await studentService.searchUsers(query);
  res.json(users);
});

export const getAssignments = asyncHandler(async (req, res) => {
  const assignments = await studentService.getAssignments(req.user._id || req.user.id);
  res.json(assignments);
});

export const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await studentService.getAnnouncements(req.user._id || req.user.id);
  res.json(announcements);
});

export const getInvitations = asyncHandler(async (req, res) => {
  const invitations = await studentService.getInvitations(req.user._id || req.user.id);
  res.json(invitations);
});

export const getStudentTimetable = asyncHandler(async (req, res) => {
  const student = await studentService.getProfile(req.user._id || req.user.id);
  const timetable = await Timetable.find({
    collegeName: student.academic.collegeName,
    course: student.academic.course,
    standard: student.academic.standard
  }).populate('teacher', 'personal.firstName personal.lastName');

  if (!timetable || timetable.length === 0) {
    throw new ApiError(404, 'No timetable found for your class');
  }

  res.json(timetable);
});
