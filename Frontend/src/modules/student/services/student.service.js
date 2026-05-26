import api from "@/services/api";

export const studentService = {
  signup: async (data) => {
    return api.post("/api/students/signup", data);
  },

  login: async (data) => {
    return api.post("/api/students/login", data);
  },

  verify: async (studentId, otp) => {
    return api.post(`/api/students/verify/${studentId}`, { otp });
  },

  getProfile: async () => {
    return api.get("/api/students/profile");
  },

  getAllStudents: async () => {
    return api.get("/api/students");
  },

  searchUsers: async (query) => {
    const response = await api.get(`/api/students/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getAssignments: async () => {
    const response = await api.get("/api/students/assignments");
    return response.data;
  },

  getAnnouncements: async () => {
    const response = await api.get("/api/students/announcements");
    return response.data;
  },

  getMyAttendance: async (course, startDate, endDate) => {
    const response = await api.get("/api/attendance/student", {
      params: {
        course,
        startDate,
        endDate
      }
    });
    return response.data;
  },

  getInvitations: async () => {
    const response = await api.get("/api/messages/invitations");
    return response.data.data;
  },

  acceptInvitation: async (invitationId) => {
    const response = await api.patch(`/api/invitations/${invitationId}/accept`);
    return response.data;
  }
};

export default studentService;
