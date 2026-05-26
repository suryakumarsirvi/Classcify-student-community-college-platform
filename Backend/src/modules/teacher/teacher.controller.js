import teacherService from './teacher.service.js';
import emailService from '../../services/email/email.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const saveDraft = asyncHandler(async (req, res) => {
  const { draftId, data } = req.body;
  const draft = await teacherService.saveDraft(draftId, data);
  res.json({
    success: true,
    draftId: draft.draftId
  });
});

export const sendOTPController = asyncHandler(async (req, res) => {
  const { draftId, phone } = req.body;
  await teacherService.sendOTP(draftId, phone);
  res.json({ success: true });
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { draftId, otp } = req.body;
  const teacher = await teacherService.verifyOTP(draftId, otp);
  res.json({ teacher });
});

export const getDraft = asyncHandler(async (req, res) => {
  const draft = await teacherService.getDraft(req.params.draftId);
  res.json(draft);
});

export const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await teacherService.getTeachers();
  res.json(teachers);
});

export const deleteTeacher = asyncHandler(async (req, res) => {
  await teacherService.deleteTeacher(req.params.id);
  res.json({ success: true });
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await teacherService.updateTeacher(req.params.id, req.body);
  res.json(teacher);
});

export const teacherLogin = asyncHandler(async (req, res) => {
  const { uid, password } = req.body;
  const result = await teacherService.teacherLogin(uid, password);
  res.json(result);
});

export const getTeacherCourses = asyncHandler(async (req, res) => {
  const courses = await teacherService.getTeacherCourses(req.user._id);
  res.json({ courses });
});

export const getTeacherProfile = asyncHandler(async (req, res) => {
  const profile = await teacherService.getTeacherProfile(req.user._id);
  res.json(profile);
});

export const getClassroomStudents = asyncHandler(async (req, res) => {
  const students = await teacherService.getClassroomStudents(req.params.classroom);
  if (!students || students.length === 0) {
    return res.json({
      success: true,
      message: 'No students available in this course',
      students: []
    });
  }
  res.json({
    success: true,
    students
  });
});

export const sendInvitationEmail = asyncHandler(async (req, res) => {
  const { title, uid, description, recipientEmail } = req.body;
  if (!title || !uid || !description || !recipientEmail) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const info = await emailService.sendInvitation({ title, uid, recipientEmail });
  res.status(200).json({ success: true, message: 'Email sent successfully', info });
});
