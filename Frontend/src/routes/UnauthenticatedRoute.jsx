import React from "react";
import { Navigate } from "react-router";

export const UnauthenticatedRoute = ({ children, role }) => {
  const token = localStorage.getItem(`${role}Token`);
  if (token) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  return children;
};
