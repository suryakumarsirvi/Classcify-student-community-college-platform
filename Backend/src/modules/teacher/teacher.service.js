import { v4 as uuidv4 } from 'uuid';
import teacherRepository from './implementations/teacher.repository.js';
import studentRepository from '../student/implementations/student.repository.js';
import smsService from '../../services/sms/sms.service.js';
import { comparePassword, hashPassword } from '../../utils/bcrypt.js';
import { signToken } from '../../utils/jwt.js';
import ApiError from '../../utils/ApiError.js';
import Student from '../../database/models/student.model.js';

class TeacherService {
  async saveDraft(draftId, data) {
    const id = draftId || uuidv4();
    const updateData = {
      ...data,
      draftId: id,
      updatedAt: new Date(),
      status: 'draft'
    };

    return await teacherRepository.findOneAndUpdate(
      { draftId: id },
      { $set: updateData },
      { upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
  }

  async sendOTP(draftId, phone) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const success = await smsService.sendOtp(phone, otp);
    if (!success) {
      throw new ApiError(500, 'Failed to send OTP');
    }

    await teacherRepository.findOneAndUpdate(
      { draftId },
      {
        otp,
        otpExpiry: Date.now() + 600000,
        'professional.phone': phone
      }
    );

    return true;
  }

  async verifyOTP(draftId, otp) {
    const teacher = await teacherRepository.findByDraftId(draftId);
    if (!teacher) {
      throw new ApiError(404, 'Draft not found');
    }

    if (teacher.otp !== otp || teacher.otpExpiry < Date.now()) {
      throw new ApiError(400, 'Invalid/Expired OTP');
    }

    const uid = `${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}@classcify.in`;

    return await teacherRepository.findByIdAndUpdate(
      teacher._id,
      {
        status: 'verified',
        'professional.uid': uid,
        otp: null,
        otpExpiry: null
      }
    );
  }

  async getDraft(draftId) {
    const teacher = await teacherRepository.findByDraftId(draftId);
    if (!teacher) {
      throw new ApiError(404, 'Draft not found');
    }
    return teacher;
  }

  async getTeachers() {
    return await teacherRepository.findVerifiedTeachers();
  }

  async deleteTeacher(id) {
    return await teacherRepository.deleteById(id);
  }

  async updateTeacher(id, updatedData) {
    return await teacherRepository.findByIdAndUpdate(id, updatedData, { runValidators: true });
  }

  async teacherLogin(uid, password) {
    const teacher = await teacherRepository.findByUid(uid);
    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }

    if (teacher.status !== 'verified') {
      throw new ApiError(403, 'Teacher not verified');
    }

    if (!teacher.auth.password) {
      if (!password) {
        throw new ApiError(400, 'Password required for first login');
      }

      const hashedPassword = await hashPassword(password, 10);
      teacher.auth.password = hashedPassword;
      teacher.auth.lastLogin = new Date();
      await teacher.save();

      const token = signToken(
        { id: teacher._id, role: 'teacher' },
        { expiresIn: '7d' }
      );

      return { token };
    }

    if (!password) {
      throw new ApiError(400, 'Password required');
    }

    const isMatch = await comparePassword(password, teacher.auth.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    teacher.auth.lastLogin = new Date();
    await teacher.save();

    const token = signToken(
      { id: teacher._id, role: 'teacher' },
      { expiresIn: '7d' }
    );

    return { token };
  }

  async getTeacherCourses(id) {
    const teacher = await teacherRepository.findById(id);
    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }
    return teacher.professional.classrooms || [];
  }

  async getTeacherProfile(id) {
    const teacher = await teacherRepository.findById(id);
    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }
    return teacher;
  }

  async getClassroomStudents(classroom) {
    const students = await Student.find({
      'academic.course': classroom
    }).select('name roll email academic');

    return students || [];
  }
}

export default new TeacherService();
