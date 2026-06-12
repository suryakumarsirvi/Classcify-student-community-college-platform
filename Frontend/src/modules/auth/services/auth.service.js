import api from "@/services/api";

export const authService = {
  login: async (credentials) => {
    const endpoint = credentials.role === "student" ? "/api/students/login" :
                    credentials.role === "teacher" ? "/api/teachers/login" :
                    "/api/admin/login";

    const { data } = await api.post(endpoint, credentials);
    return data;
  },

  register: async (userData) => {
    const { data } = await api.post("/api/auth/register", userData);
    return data;
  },

  updateUser: async (userData, role) => {
    const endpoint = role === "student" ? "/api/students/profile" :
                     role === "teacher" ? "/api/teachers/profile" :
                     "/api/admin/profile";

    const { data } = await api.put(endpoint, userData);
    return data;
  },

  getProfile: async (role) => {
    const endpoint = role === "student" ? "/api/students/profile" :
                    role === "teacher" ? "/api/teachers/profile" :
                    "/api/admin/profile";
    const { data } = await api.get(endpoint);
    return data;
  }
};
