import api from "@/services/api";

export const teacherService = {
  getTeacherAttendance: async (params) => {
    const response = await api.get("/api/attendance/teacher", { params });
    return response.data;
  },

  updateAttendance: async (data) => {
    const response = await api.post("/api/attendance/teacher", data);
    return response.data;
  },

  getTeacherCourses: async () => {
    const response = await api.get("/api/teachers/courses");
    return response.data;
  },

  createTimetable: async (data) => {
    const response = await api.post("/api/timetable", data);
    return response.data;
  },

  getTimetable: async () => {
    const response = await api.get("/api/timetable");
    return response.data;
  },

  createAssignment: async (data) => {
    const response = await api.post("/api/assignments", {
      ...data,
      course: data.course || "General",
    });
    return response.data;
  },

  getAssignments: async () => {
    const response = await api.get("/api/assignments");
    return response.data;
  },

  createAnnouncement: async (data) => {
    const response = await api.post("/api/announcements", data);
    return response.data;
  },

  getAnnouncements: async () => {
    const response = await api.get("/api/announcements");
    return response.data;
  },

  uploadResource: async (formData) => {
    const response = await api.post("/api/resources", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getResources: async () => {
    const response = await api.get("/api/resources");
    return response.data;
  },

  markAttendance: async (data) => {
    const response = await api.post("/api/attendance", data);
    return response.data;
  },

  getAttendance: async (course, date) => {
    const response = await api.get("/api/attendance", {
      params: { course, date },
    });
    return response.data;
  },

  getAttendanceStats: async (course, startDate, endDate) => {
    const response = await api.get("/api/attendance/stats", {
      params: { course, startDate, endDate },
    });
    return response.data;
  },

  updateAttendanceRecord: async (attendanceId, data) => {
    const response = await api.put(`/api/attendance/${attendanceId}`, data);
    return response.data;
  },

  getClassroomStudents: async (classroom) => {
    const response = await api.get(`/api/teachers/classroom/${classroom}/students`);
    return response.data;
  },

  getStudentAttendanceHeatmap: async (studentId, classroom) => {
    const response = await api.get(`/api/attendance/heatmap/${studentId}`, {
      params: { classroom },
    });
    return response.data;
  },
};

export default teacherService;
