// api/student.api.js
import api from './axios';

const studentApi = {
  signup: (data) =>
    api
      .post('/api/students/signup', data)
      .catch((error) => {
        if (error.response) {
          if (error.response.data?.error?.name === 'ValidationError') {
            const messages = Object.values(error.response.data.error.errors).map(
              (e) => e.message
            );
            error.response.data.error = messages.join(', ');
          }
        }
        throw error;
      }),

  login: async (data) => {
    try {
      console.log("API login request:", {
        url: '/api/students/login',
        data: JSON.stringify(data, null, 2)
      });

      const response = await api.post('/api/students/login', data);

      console.log("API login response:", {
        status: response.status,
        data: response.data
      });

      return response;
    } catch (error) {
      console.error("Login API error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  verify: (studentId, otp) =>
    api.post(`/api/students/verify/${studentId}`, { otp }).catch((error) => {
      throw error;
    }),

  getProfile: () =>
    api.get('/api/students/profile').catch((error) => {
      throw error;
    }),

  getAllStudents: () =>
    api.get('/api/students').catch((error) => {
      throw error;
    }),

  searchUsers: async (query) => {
    try {
      const response = await api.get(`/api/students/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Search failed';
    }
  },

  // Get student's assignments
  getAssignments: async () => {
    try {
      const response = await api.get('/api/students/assignments');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
      throw error.response?.data?.message || 'Failed to fetch assignments';
    }
  },

  // Get student's announcements
  getAnnouncements: async () => {
    try {
      const response = await api.get('/api/students/announcements');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching announcements:', error);
      throw error.response?.data?.message || 'Failed to fetch announcements';
    }
  },

  // Get student's attendance for a course
  getMyAttendance: async (course, startDate, endDate) => {
    try {
      const response = await api.get('/api/attendance/student', {
        params: {
          course,
          startDate,
          endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching attendance:', error);
      throw error.response?.data?.message || 'Failed to fetch attendance';
    }
  },

  getInvitations: async () => {
    try {
      const response = await api.get('/api/messages/invitations');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  },

  acceptInvitation: async (invitationId) => {
    try {
      const response = await api.patch(`/api/invitations/${invitationId}/accept`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default studentApi;
