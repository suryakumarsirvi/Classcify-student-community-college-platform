class DashboardRepositoryContract {
  async getTeacherCount() { throw new Error('Method not implemented'); }
  async getStudentCount() { throw new Error('Method not implemented'); }
  async getAssignmentCount() { throw new Error('Method not implemented'); }
  async getResourceCount() { throw new Error('Method not implemented'); }
  async getRecentTeachers() { throw new Error('Method not implemented'); }
  async getRecentAdmissionsCount(sinceDate) { throw new Error('Method not implemented'); }
  async getRecentAnnouncements() { throw new Error('Method not implemented'); }
  async getStudentMonthlyRegistrations(sinceDate) { throw new Error('Method not implemented'); }
}

export default DashboardRepositoryContract;
