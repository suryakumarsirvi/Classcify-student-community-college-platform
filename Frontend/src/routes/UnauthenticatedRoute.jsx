// routes/UnauthenticatedRoute.jsx
import { Navigate } from "react-router-dom";

export const UnauthenticatedRoute = ({ children, role }) => {
  const token = localStorage.getItem(`${role}Token`);
  if (token) {
    // If already logged in, send them to their dashboard
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  return children;
};
