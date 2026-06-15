import studentRepository from './implementations/student.repository.js';
import emailService from '../../services/email/email.service.js';
import Assignment from '../../database/models/assignment.model.js';
import Announcement from '../../database/models/announcement.model.js';
import Invitation from '../../database/models/invitation.model.js';
import { hashPassword, comparePassword } from '../../utils/bcrypt.js';
import { signToken } from '../../utils/jwt.js';
import ApiError from '../../utils/ApiError.js';

class StudentService {
  async signup(personal, academic, other, authData) {
    const existingStudent = await studentRepository.findByEmail(personal.email);
    if (existingStudent) {
      throw new ApiError(400, 'Email already exists');
    }

    const hashedPassword = await hashPassword(authData.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    try {
      const emailResponse = await emailService.sendOtp(personal.email, otp);   
    } catch (error) {
      throw new ApiError(500, 'Otp sending email failed', error.message);
      console.log("Error sending otp mail: " + error.message)
    }

    if (!emailResponse.success) {
      throw new ApiError(500, 'User registered but OTP email failed', emailResponse.error);
    }

    const student = await studentRepository.create({
      personal,
      academic,
      other: {
        interests: other.interests,
        personalityType: other.personalityType,
        genz: other.genz || false
      },
      auth: {
        password: hashedPassword,
        otp,
        otpExpires
      }
    });

    return student;
  }

  async verify(studentId, otp) {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new ApiError(404, 'Student not found');
    }

    const fullStudent = await studentRepository.findByIdAndUpdate(studentId, {}, {
      select: '+auth.otp +auth.otpExpires'
    });

    if (fullStudent.auth.otp !== otp || fullStudent.auth.otpExpires < new Date()) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    fullStudent.auth.isVerified = true;
    fullStudent.auth.otp = undefined;
    fullStudent.auth.otpExpires = undefined;
    await fullStudent.save();

    const token = signToken({ id: student._id, role: 'student' }, { expiresIn: '1d' });
    return token;
  }

  async login(email, password) {
    const student = await studentRepository.findByEmail(email);
    if (!student) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const fullStudent = await studentRepository.findByIdAndUpdate(student._id, {}, {
      select: '+auth.password +auth.isVerified'
    });

    const isValidPassword = await comparePassword(password, fullStudent.auth.password);
    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!fullStudent.auth.isVerified) {
      throw new ApiError(401, 'Email not verified');
    }

    const token = signToken({ id: student._id, role: 'student' }, { expiresIn: '1d' });

    const userData = await studentRepository.findById(student._id);
    return {
      token,
      user: userData,
      role: 'student'
    };
  }

  async getProfile(id) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw new ApiError(404, 'Student not found');
    }
    return student;
  }

  async updateProfile(id, updateData) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw new ApiError(404, 'Student not found');
    }

    if (updateData.name) {
      const parts = updateData.name.trim().split(/\s+/);
      student.personal.firstName = parts[0] || student.personal.firstName;
      student.personal.lastName = parts.slice(1).join(' ') || '';
    }

    if (updateData.email) {
      const existing = await studentRepository.findByEmail(updateData.email);
      if (existing && existing._id.toString() !== id.toString()) {
        throw new ApiError(400, 'Email already in use');
      }
      student.personal.email = updateData.email;
    }

    await student.save();
    return student;
  }

  async getAllStudents() {
    return await studentRepository.findAll();
  }

  async searchUsers(queryStr) {
    return await studentRepository.search(queryStr);
  }

  async getAssignments(studentId) {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new ApiError(404, 'Student not found');
    }

    return await Assignment.find({
      course: student.academic.course,
      dueDate: { $gte: new Date() }
    }).sort({ dueDate: 1 });
  }

  async getAnnouncements(studentId) {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new ApiError(404, 'Student not found');
    }

    return await Announcement.find({
      $or: [
        { course: student.academic.course },
        { course: { $exists: false } },
        { course: null }
      ]
    }).sort({ date: -1 });
  }

  async getInvitations(studentId) {
    const invitations = await Invitation.find({
      recipient: studentId,
      recipientType: 'Student',
      status: 'pending'
    })
      .populate('community', 'name image')
      .populate({
        path: 'sender',
        select: 'personal.firstName personal.lastName role'
      });

    return invitations.map(invitation => {
      const senderName = invitation.sender
        ? `${invitation.sender.personal?.firstName || ''} ${invitation.sender.personal?.lastName || ''}`.trim()
        : 'Unknown User';

      return {
        _id: invitation._id,
        community: {
          _id: invitation.community._id,
          name: invitation.community.name,
          image: invitation.community.image
        },
        sender: {
          _id: invitation.sender?._id || null,
          name: senderName,
          type: invitation.sender?.role || 'Student'
        },
        status: invitation.status,
        createdAt: invitation.createdAt
      };
    });
  }
}

export default new StudentService();
