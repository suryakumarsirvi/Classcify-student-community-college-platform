import axios from "axios";
import { ApiError } from "@/errors/ApiError";
import { ErrorCodes } from "@/errors/ErrorCodes";
import { ErrorMessages } from "@/errors/ErrorMessages";
import { logger } from "@/utils/logger";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("studentToken") ||
      localStorage.getItem("teacherToken") ||
      localStorage.getItem("adminToken");

    if (token) {
      const cleanToken = token.replace(/['"]/g, "").trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    const controller = new AbortController();
    config.signal = controller.signal;
    config.controller = controller;

    return config;
  },
  (error) => {
    logger.error({ module: "network", source: "api.js" }, "Request setup failure.", error);
    return Promise.reject(
      new ApiError({
        name: ErrorCodes.UNKNOWN_ERROR,
        message: ErrorMessages.UNKNOWN_ERROR,
        status: 400,
        source: "api.js",
        originalError: error,
      })
    );
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let apiError;

    if (error.code === "ECONNABORTED") {
      apiError = new ApiError({
        name: ErrorCodes.NETWORK_ERROR,
        message: ErrorMessages.NETWORK_ERROR,
        status: 408,
        source: "api.js",
        originalError: error,
      });
    } else if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const errorMsg = data?.error || data?.message || ErrorMessages.UNKNOWN_ERROR;

      if (status === 401) {
        apiError = new ApiError({
          name: ErrorCodes.UNAUTHORIZED,
          message: data?.error || data?.message || ErrorMessages.UNAUTHORIZED,
          status,
          source: "api.js",
          originalError: error,
        });
      } else if (status === 403) {
        apiError = new ApiError({
          name: ErrorCodes.FORBIDDEN,
          message: data?.error || data?.message || ErrorMessages.FORBIDDEN,
          status,
          source: "api.js",
          originalError: error,
        });
      } else if (status === 404) {
        apiError = new ApiError({
          name: ErrorCodes.NOT_FOUND,
          message: data?.error || data?.message || ErrorMessages.NOT_FOUND,
          status,
          source: "api.js",
          originalError: error,
        });
      } else {
        apiError = new ApiError({
          name: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: errorMsg,
          status,
          source: "api.js",
          originalError: error,
        });
      }
    } else if (error.request) {
      apiError = new ApiError({
        name: ErrorCodes.NETWORK_ERROR,
        message: ErrorMessages.NETWORK_ERROR,
        status: 0,
        source: "api.js",
        originalError: error,
      });
    } else {
      apiError = new ApiError({
        name: ErrorCodes.UNKNOWN_ERROR,
        message: error.message || ErrorMessages.UNKNOWN_ERROR,
        status: 500,
        source: "api.js",
        originalError: error,
      });
    }

    logger.error({ module: "network", source: "api.js" }, "API Request Failure Details", apiError);
    return Promise.reject(apiError);
  }
);

export const cancelPendingRequests = () => {
  const pendingRequests = api.interceptors.request.handlers;
  pendingRequests.forEach((handler) => {
    if (handler.controller) {
      handler.controller.abort();
    }
  });
};

export default api;
