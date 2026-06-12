import React, { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/services/api";
import { setUser, setLoading, logoutUser } from "@/modules/auth/store/auth.slice";
import { authService } from "@/modules/auth/services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const studentToken = localStorage.getItem("studentToken");
        const teacherToken = localStorage.getItem("teacherToken");
        const adminToken = localStorage.getItem("adminToken");

        if (!studentToken && !teacherToken && !adminToken) {
          dispatch(setLoading(false));
          return;
        }

        if (studentToken) {
          api.defaults.headers.common["Authorization"] = `Bearer ${studentToken}`;
          const data = await authService.getProfile("student");
          dispatch(setUser({ ...data, role: "student" }));
        } else if (teacherToken) {
          api.defaults.headers.common["Authorization"] = `Bearer ${teacherToken}`;
          const data = await authService.getProfile("teacher");
          dispatch(setUser({ ...data, role: "teacher" }));
        } else if (adminToken) {
          api.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
          const data = await authService.getProfile("admin");
          dispatch(setUser({ ...data, role: "admin" }));
        }
      } catch (error) {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("teacherToken");
        localStorage.removeItem("adminToken");
        delete api.defaults.headers.common["Authorization"];
        dispatch(setUser(null));
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      const tokenKey = `${credentials.role}Token`;
      localStorage.setItem(tokenKey, data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      dispatch(setUser({ ...data.user, role: credentials.role }));
      return data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      if (data.role === "student") {
        localStorage.setItem("studentToken", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      } else if (data.role === "teacher") {
        localStorage.setItem("teacherToken", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      dispatch(setUser({ ...data.user, role: data.role }));
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
    dispatch(logoutUser());
  };

  const updateUser = async (userData) => {
    try {
      const data = await authService.updateUser(userData, user?.role);
      dispatch(setUser({ ...data, role: user?.role }));
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
