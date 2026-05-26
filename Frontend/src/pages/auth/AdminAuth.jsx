
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom"; // Add this import

export default function AdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Add this state
  
  // Add this useEffect to check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        setIsAuthenticated(true);
        window.location.href = "/admin/dashboard";
      }
    };
    checkAuth();
  }, []);

  // Add this before return statement
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ... rest of your existing code
}