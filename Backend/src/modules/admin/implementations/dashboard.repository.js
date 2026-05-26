import Teacher from '../../../database/models/teacher.model.js';
import Student from '../../../database/models/student.model.js';
import Assignment from '../../../database/models/assignment.model.js';
import Resource from '../../../database/models/resource.model.js';
import Announcement from '../../../database/models/announcement.model.js';
import DashboardRepositoryContract from '../contracts/dashboard.repository.contract.js';

class DashboardRepository extends DashboardRepositoryContract {
  async getTeacherCount() {
    return await Teacher.countDocuments({ status: { $in: ['active', 'verified'] } });
  }

  async getStudentCount() {
    return await Student.countDocuments({ 'auth.isVerified': true });
  }

  async getAssignmentCount() {
    return await Assignment.countDocuments();
  }

  async getResourceCount() {
    return await Resource.countDocuments();
  }

  async getRecentTeachers() {
    return await Teacher.find({ status: { $in: ['active', 'verified'] } })
      .select('personal.name professional.role status professional.classrooms')
      .sort({ createdAt: -1 })
      .limit(3);
  }

  async getRecentAdmissionsCount(sinceDate) {
    return await Student.countDocuments({
      createdAt: { $gte: sinceDate }
    });
  }

  async getRecentAnnouncements() {
    return await Announcement.find()
      .sort({ date: -1 })
      .limit(3)
      .select('title date');
  }

  async getStudentMonthlyRegistrations(sinceDate) {
    return await Student.aggregate([
      {
        $match: {
          createdAt: { $gte: sinceDate }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          users: { $sum: 1 },
          revenue: { $sum: 100 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
  }
}

export default new DashboardRepository();
