import Attendance from '../../../database/models/attendance.model.js';
import AttendanceRepositoryContract from '../contracts/attendance.repository.contract.js';

class AttendanceRepository extends AttendanceRepositoryContract {
  async findOne(query) {
    return await Attendance.findOne(query)
      .populate('students.student', 'personal.firstName personal.lastName personal.email')
      .populate('teacher', 'personal.name professional.email');
  }

  async find(query) {
    return await Attendance.find(query)
      .populate('teacher', 'personal.name professional.email');
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    return await Attendance.findByIdAndUpdate(id, updateData, { new: true, ...options });
  }

  async aggregate(pipeline) {
    return await Attendance.aggregate(pipeline);
  }

  async create(attendanceData) {
    const attendance = new Attendance(attendanceData);
    return await attendance.save();
  }
}

export default new AttendanceRepository();
