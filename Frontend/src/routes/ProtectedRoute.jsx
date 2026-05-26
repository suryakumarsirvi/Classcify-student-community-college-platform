import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { toast } from "react-toastify";
// import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem(`${role}Token`);

  useEffect(() => {
    console.log(`Fetched ${role} Token:`, token);
  }, [token]);

  if (!token || token === "undefined" || token === "null") {
    console.warn("⚠️ Token Missing! Staying on page.");
    toast.warn("Session expired! Please refresh the page.");
    return children; // ⛔ Do not redirect, just show a warning
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds

    if (decodedToken.exp < currentTime) {
      console.warn("⚠️ Token Expired, but not logging out.");
      toast.warn("Session expired! Please refresh the page.");
      return children; // ⛔ Do not remove token, just warn
    }
  } catch (error) {
    console.error("❌ Invalid Token! Showing error but not logging out.");
    toast.error("Invalid session! Please refresh the page.");
    return children; // ⛔ Do not remove token, just warn
  }

  return children;
};

export default ProtectedRoute;