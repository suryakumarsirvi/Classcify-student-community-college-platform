
import api from './axios';

const studentApi = {
  signup: (data) =>
    api
      .post('/api/students/signup', data)
      .catch((error) => {
        if (error.originalError?.response) {
          const data = error.originalError.response.data;
          if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
            error.message = data.errors.map(e => e.message || e).join(', ');
          } else if (data?.message) {
            error.message = data.message;
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
      throw error.message || error.originalError?.response?.data?.message || 'Search failed';
    }
  },

  
  getAssignments: async () => {
    try {
      const response = await api.get('/api/students/assignments');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
      throw error.message || error.originalError?.response?.data?.message || 'Failed to fetch assignments';
    }
  },

  
  getAnnouncements: async () => {
    try {
      const response = await api.get('/api/students/announcements');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching announcements:', error);
      throw error.message || error.originalError?.response?.data?.message || 'Failed to fetch announcements';
    }
  },

  
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
      throw error.message || error.originalError?.response?.data?.message || 'Failed to fetch attendance';
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
