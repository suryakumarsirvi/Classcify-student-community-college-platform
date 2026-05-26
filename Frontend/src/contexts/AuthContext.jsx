// contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for tokens
        const studentToken = localStorage.getItem("studentToken");
        const teacherToken = localStorage.getItem("teacherToken");
        const adminToken = localStorage.getItem("adminToken");

        if (!studentToken && !teacherToken && !adminToken) {
          setLoading(false);
          return;
        }

        // Set the token in axios headers
        if (studentToken) {
          api.defaults.headers.common["Authorization"] = `Bearer ${studentToken}`;
          const { data } = await api.get("/api/students/profile");
          setUser({ ...data, role: "student" });
        } else if (teacherToken) {
          api.defaults.headers.common["Authorization"] = `Bearer ${teacherToken}`;
          const { data } = await api.get("/api/teachers/profile");
          setUser({ ...data, role: "teacher" });
        } else if (adminToken) {
          api.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
          const { data } = await api.get("/api/admin/profile");
          setUser({ ...data, role: "admin" });
        }
      } catch (error) {
        console.error("Auth Error:", error);
        // Clear tokens on error
        localStorage.removeItem("studentToken");
        localStorage.removeItem("teacherToken");
        localStorage.removeItem("adminToken");
        // Clear axios headers
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const endpoint = credentials.role === "student" ? "/api/students/login" :
                      credentials.role === "teacher" ? "/api/teachers/login" :
                      "/api/admin/login";

      const { data } = await api.post(endpoint, credentials);
      
      // Store token based on role
      const tokenKey = `${credentials.role}Token`;
      localStorage.setItem(tokenKey, data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      setUser({ ...data.user, role: credentials.role });
      return data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post("/api/auth/register", userData);
      
      // Store token based on role
      if (data.role === "student") {
        localStorage.setItem("studentToken", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      } else if (data.role === "teacher") {
        localStorage.setItem("teacherToken", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }

      setUser({ ...data.user, role: data.role });
      return data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const logout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("adminToken");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateUser = async (userData) => {
    try {
      const formData = new FormData();
      
      // Append all user data to FormData
      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined && userData[key] !== null) {
          formData.append(key, userData[key]);
        }
      });

      const { data } = await api.put("/api/auth/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(prev => ({ ...data, role: prev.role }));
      return data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
