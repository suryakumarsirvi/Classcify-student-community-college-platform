import mongoose from 'mongoose';
import attendanceRepository from './implementations/attendance.repository.js';
import studentRepository from '../student/implementations/student.repository.js';
import ApiError from '../../utils/ApiError.js';

class AttendanceService {
  async markAttendance(course, students, date, teacherId) {
    const totals = students.reduce((acc, curr) => {
      acc[curr.status]++;
      return acc;
    }, { present: 0, absent: 0, late: 0 });

    return await attendanceRepository.create({
      course,
      date: date || new Date(),
      teacher: teacherId,
      students,
      totalPresent: totals.present,
      totalAbsent: totals.absent,
      totalLate: totals.late
    });
  }

  async getAttendance(course, date) {
    const record = await attendanceRepository.findOne({ course, date });
    if (!record) {
      throw new ApiError(404, 'No attendance record found');
    }
    return record;
  }

  async getAttendanceStats(course, startDate, endDate) {
    const query = {
      course,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const stats = await attendanceRepository.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalClasses: { $sum: 1 },
          totalPresent: { $sum: '$totalPresent' },
          totalAbsent: { $sum: '$totalAbsent' },
          totalLate: { $sum: '$totalLate' },
          averageAttendance: {
            $avg: {
              $divide: ['$totalPresent', { $add: ['$totalPresent', '$totalAbsent', '$totalLate'] }]
            }
          }
        }
      }
    ]);

    const studentStats = await attendanceRepository.aggregate([
      { $match: query },
      { $unwind: '$students' },
      {
        $group: {
          _id: '$students.student',
          totalPresent: {
            $sum: { $cond: [{ $eq: ['$students.status', 'present'] }, 1, 0] }
          },
          totalAbsent: {
            $sum: { $cond: [{ $eq: ['$students.status', 'absent'] }, 1, 0] }
          },
          totalLate: {
            $sum: { $cond: [{ $eq: ['$students.status', 'late'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' }
    ]);

    return {
      stats: stats[0] || {
        totalClasses: 0,
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        averageAttendance: 0
      },
      studentStats
    };
  }

  async updateAttendance(attendanceId, students) {
    const totals = students.reduce((acc, curr) => {
      acc[curr.status]++;
      return acc;
    }, { present: 0, absent: 0, late: 0 });

    const record = await attendanceRepository.findByIdAndUpdate(
      attendanceId,
      {
        students,
        totalPresent: totals.present,
        totalAbsent: totals.absent,
        totalLate: totals.late
      }
    );

    if (!record) {
      throw new ApiError(404, 'Attendance record not found');
    }

    return record;
  }

  async getStudentAttendance(studentId, course, startDate, endDate) {
    const records = await attendanceRepository.find({
      course,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      'students.student': studentId
    });

    const stats = records.reduce((acc, record) => {
      const entry = record.students.find(s => s.student.toString() === studentId.toString());
      if (entry) {
        acc[entry.status]++;
        acc.total++;
      }
      return acc;
    }, { present: 0, absent: 0, late: 0, total: 0 });

    return {
      stats,
      records
    };
  }

  async getAttendanceHeatmap(studentId, classroom) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const records = await attendanceRepository.find({
      course: classroom,
      date: {
        $gte: startDate,
        $lte: endDate
      },
      'students.student': studentId
    });

    return records.reduce((acc, record) => {
      const dateStr = record.date.toISOString().split('T')[0];
      const entry = record.students.find(s => s.student.toString() === studentId.toString());
      if (entry) {
        acc[dateStr] = {
          status: entry.status,
          remark: entry.remark
        };
      }
      return acc;
    }, {});
  }

  async getStudentDetailedStats(studentId) {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new ApiError(404, 'Student not found');
    }

    const records = await attendanceRepository.find({
      course: student.academic.course,
      'students.student': studentId
    });

    const overallStats = {
      totalClasses: records.length,
      present: 0,
      absent: 0,
      late: 0,
      percentage: 0
    };

    const detailedRecords = records.map(record => {
      const entry = record.students.find(s => s.student.toString() === studentId.toString());
      if (entry) {
        overallStats[entry.status]++;
      }

      return {
        date: record.date,
        status: entry ? entry.status : 'N/A',
        remark: entry ? entry.remark : '',
        teacher: record.teacher ? record.teacher.name : 'Unknown'
      };
    });

    if (overallStats.totalClasses > 0) {
      overallStats.percentage = Number(((overallStats.present + overallStats.late) / overallStats.totalClasses * 100).toFixed(2));
    }

    return {
      course: student.academic.course,
      overallStats,
      detailedRecords
    };
  }
}

export default new AttendanceService();
