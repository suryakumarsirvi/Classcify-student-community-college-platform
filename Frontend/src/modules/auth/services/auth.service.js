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

  updateUser: async (userData) => {
    const formData = new FormData();
    Object.keys(userData).forEach((key) => {
      if (userData[key] !== undefined && userData[key] !== null) {
        formData.append(key, userData[key]);
      }
    });

    const { data } = await api.put("/api/auth/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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
