import api from './axios';

const teacherApi = {
  getTeacherAttendance: async (params) => {
    try {
      const response = await api.get('/api/attendance/teacher', { params });
      console.log("✅ Attendance Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Attendance fetch error:", error.response?.data);
      throw error.response?.data?.error || 'Failed to fetch attendance';
    }
  },

  updateAttendance: async (data) => {
    try {
      const response = await api.post('/api/attendance/teacher', data);
      console.log("✅ Attendance Updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Attendance update error:", error.response?.data);
      throw error.response?.data?.error || 'Failed to update attendance';
    }
  },

  getTeacherCourses: async () => {
    try {
      console.log("📚 Fetching teacher courses...");
      const response = await api.get('/api/teachers/courses');
      console.log("✅ Courses Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Courses fetch error:", error.response?.data);
      throw error.response?.data?.error || 'Failed to fetch courses';
    }
  },

  createTimetable: async (data) => {
    console.log("📝 Creating timetable with data:", data);
    try {
      const response = await api.post('/api/timetable', data);
      console.log("✅ Timetable Created:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Timetable creation error:", error.response?.data);
      throw error.response?.data?.error || 'Failed to create timetable';
    }
  },

  getTimetable: async () => {
    console.log("🔍 Fetching timetable...");
    try {
      const response = await api.get('/api/timetable');
      console.log("✅ Timetable Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Timetable fetch error:", error.response?.data);
      throw error.response?.data?.error || 'Failed to fetch timetable';
    }
  },

  createAssignment: async (data) => {
    console.log("📝 Creating assignment with data:", data);
    try {
      const response = await api.post('/api/assignments', {
        ...data,
        course: data.course || "General",
      });
      console.log("✅ Assignment Created:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Assignment creation error:", error.response?.data);
      throw error.response?.data?.error || 'Failed to create assignment';
    }
  },

  getAssignments: async () => {
    console.log("🔍 Fetching assignments...");
    try {
      const response = await api.get('/api/assignments');
      console.log("✅ Assignments Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Assignments fetch error:", error.response?.data);
      throw error.response?.data?.error || 'Failed to fetch assignments';
    }
  },

  createAnnouncement: async (data) => {
    console.log("📢 Creating announcement with data:", data);
    try {
      const response = await api.post('/api/announcements', data);
      console.log("✅ Announcement Created:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Announcement creation error:", error.response?.data);
      throw error.response?.data?.error || 'Failed to create announcement';
    }
  },

  getAnnouncements: async () => {
    console.log("🔍 Fetching announcements...");
    try {
      const response = await api.get('/api/announcements');
      console.log("✅ Announcements Response:", response.data);
      if (!response || !response.data) {
        throw new Error("No response from API");
      }
      return response.data;
    } catch (error) {
      console.error("❌ Announcements fetch error:", error.response?.data);
      throw error.response?.data?.error || 'Failed to fetch announcements';
    }
  },

  uploadResource: async (formData) => {
    try {
      const response = await api.post('/api/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("✅ Resource Uploaded:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Resource upload error:", error.response?.data);
      throw error.response?.data?.error || 'Failed to upload resource';
    }
  },

  getResources: async () => {
    try {
      const response = await api.get('/api/resources');
      console.log("✅ Resources Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Resources fetch error:", error.response?.data);
      throw error.response?.data?.error || 'Failed to fetch resources';
    }
  },

  // Mark attendance for a class
  markAttendance: async (data) => {
    try {
      const response = await api.post('/api/attendance', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking attendance:', error);
      throw error.response?.data?.message || 'Failed to mark attendance';
    }
  },

  // Get attendance for a specific date and course
  getAttendance: async (course, date) => {
    try {
      const response = await api.get('/api/attendance', {
        params: { course, date }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching attendance:', error);
      throw error.response?.data?.message || 'Failed to fetch attendance';
    }
  },

  // Get attendance statistics
  getAttendanceStats: async (course, startDate, endDate) => {
    try {
      const response = await api.get('/api/attendance/stats', {
        params: { course, startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching attendance stats:', error);
      throw error.response?.data?.message || 'Failed to fetch attendance statistics';
    }
  },

  // Update attendance record
  updateAttendanceRecord: async (attendanceId, data) => {
    try {
      const response = await api.put(`/api/attendance/${attendanceId}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating attendance:', error);
      throw error.response?.data?.message || 'Failed to update attendance';
    }
  },

  // Get students by classroom
  getClassroomStudents: async (classroom) => {
    try {
      const response = await api.get(`/api/teachers/classroom/${classroom}/students`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching classroom students:', error);
      throw error.response?.data?.message || 'Failed to fetch students';
    }
  },

  // Get student attendance heatmap data
  getStudentAttendanceHeatmap: async (studentId, classroom) => {
    try {
      const response = await api.get(`/api/attendance/heatmap/${studentId}`, {
        params: { classroom }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching attendance heatmap:', error);
      throw error.response?.data?.message || 'Failed to fetch attendance heatmap';
    }
  }
};

export default teacherApi;