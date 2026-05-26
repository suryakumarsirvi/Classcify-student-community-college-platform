import adminRepository from './implementations/admin.repository.js';
import dashboardRepository from './implementations/dashboard.repository.js';
import reportRepository from './implementations/report.repository.js';
import Announcement from '../../database/models/announcement.model.js';
import { comparePassword, hashPassword } from '../../utils/bcrypt.js';
import { signToken } from '../../utils/jwt.js';
import ApiError from '../../utils/ApiError.js';
import { ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD } from '../../config/env.config.js';

class AdminService {
  async initAdmin() {
    const existing = await adminRepository.findByEmail(ADMIN_EMAIL);
    if (existing) {
      throw new ApiError(400, 'Admin already exists');
    }

    const hashedPassword = await hashPassword(ADMIN_INITIAL_PASSWORD, 12);
    return await adminRepository.create({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Super Admin'
    });
  }

  async login(email, password) {
    if (email !== ADMIN_EMAIL) {
      throw new ApiError(400, 'Invalid admin credentials');
    }

    const admin = await adminRepository.findByEmail(email);
    if (!admin) {
      throw new ApiError(400, 'Admin not found');
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      throw new ApiError(400, 'Invalid credentials');
    }

    const token = signToken(
      { id: admin._id, role: 'admin' },
      { expiresIn: '30d' }
    );

    return {
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    };
  }

  async getProfile(id) {
    const admin = await adminRepository.findById(id);
    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }
    return admin;
  }

  async getDashboardStats() {
    const [teacherCount, studentCount, assignmentCount, resourceCount] = await Promise.all([
      dashboardRepository.getTeacherCount(),
      dashboardRepository.getStudentCount(),
      dashboardRepository.getAssignmentCount(),
      dashboardRepository.getResourceCount()
    ]);

    return {
      teacherCount,
      studentCount,
      assignmentCount,
      resourceCount,
      storageUsed: 78
    };
  }

  async getRecentTeachers() {
    const teachers = await dashboardRepository.getRecentTeachers();
    return teachers.map(t => ({
      id: t._id,
      name: t.personal.name,
      subject: t.professional.role,
      status: t.status,
      classes: t.professional.classrooms?.length || 0
    }));
  }

  async getAdmissionsStats() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyCount = await dashboardRepository.getRecentAdmissionsCount(oneWeekAgo);
    const progress = Math.min((weeklyCount / 50) * 100, 100);

    return {
      weeklyCount,
      progress
    };
  }

  async getRecentAnnouncements() {
    const announcements = await dashboardRepository.getRecentAnnouncements();
    return announcements.map(a => ({
      id: a._id,
      title: a.title,
      date: a.date.toISOString().split('T')[0]
    }));
  }

  async broadcastAnnouncement(message, audience) {
    const announcement = new Announcement({
      title: message.substring(0, 50),
      content: message,
      course: audience === 'all' ? 'All' : audience,
      date: new Date()
    });

    await announcement.save();
    return announcement;
  }

  async getAnalyticsStats() {
    const totalUsers = await StudentCountStub();
    const activeSessions = await ActiveSessionsStub();
    const monthlyRevenue = 45234;
    const conversionRate = totalUsers > 0 ? ((activeSessions / totalUsers) * 100).toFixed(1) : '0.0';

    return [
      {
        title: 'Total Users',
        value: totalUsers.toString(),
        progress: 65,
        change: '+12.3%'
      },
      {
        title: 'Active Sessions',
        value: activeSessions.toString(),
        progress: totalUsers > 0 ? (activeSessions / totalUsers) * 100 : 0,
        change: '+5.4%'
      },
      {
        title: 'Monthly Revenue',
        value: `$${monthlyRevenue}`,
        progress: 78,
        change: '+24.7%'
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate}%`,
        progress: parseInt(conversionRate),
        change: '+5.4%'
      }
    ];

    async function StudentCountStub() {
      return await dashboardRepository.getStudentCount();
    }
    async function ActiveSessionsStub() {
      return await dashboardRepository.getStudentCount();
    }
  }

  async getAnalyticsChartData() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await dashboardRepository.getStudentMonthlyRegistrations(sixMonthsAgo);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return monthlyData.map(data => ({
      name: months[data._id.month - 1],
      users: data.users,
      revenue: data.revenue
    }));
  }

  async getAllReports() {
    return await reportRepository.findAll();
  }

  async createReport(reportData) {
    return await reportRepository.create(reportData);
  }

  async updateReport(id, reportData) {
    const report = await reportRepository.update(id, reportData);
    if (!report) {
      throw new ApiError(404, 'Report not found');
    }
    return report;
  }

  async deleteReport(id) {
    const report = await reportRepository.delete(id);
    if (!report) {
      throw new ApiError(404, 'Report not found');
    }
    return report;
  }
}

export default new AdminService();
