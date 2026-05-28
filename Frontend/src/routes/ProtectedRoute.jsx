import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { Navigate } from "react-router";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem(`${role}Token`);

  useEffect(() => {
    console.log(`Fetched ${role} Token:`, token);
  }, [token]);

  if (!token || token === "undefined" || token === "null") {
    console.warn("⚠️ Token Missing! Redirecting to login.");
    return <Navigate to={`/${role}/login`} replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      console.warn("⚠️ Token Expired! Redirecting to login.");
      localStorage.removeItem(`${role}Token`);
      return <Navigate to={`/${role}/login`} replace />;
    }
  } catch (error) {
    console.error("❌ Invalid Token! Redirecting to login.");
    localStorage.removeItem(`${role}Token`);
    return <Navigate to={`/${role}/login`} replace />;
  }

  return children;
};

export default ProtectedRoute;

