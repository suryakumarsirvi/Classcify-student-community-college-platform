import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem(`${role}Token`);

  useEffect(() => {
    console.log(`Fetched ${role} Token:`, token);
  }, [token]);

  if (!token || token === "undefined" || token === "null") {
    console.warn("⚠️ Token Missing! Staying on page.");
    toast.warn("Session expired! Please refresh the page.");
    return children;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      console.warn("⚠️ Token Expired, but not logging out.");
      toast.warn("Session expired! Please refresh the page.");
      return children;
    }
  } catch (error) {
    console.error("❌ Invalid Token! Showing error but not logging out.");
    toast.error("Invalid session! Please refresh the page.");
    return children;
  }

  return children;
};

export default ProtectedRoute;
