import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Check if user is authenticated and has admin role
  if (!isAuthenticated || user?.role !== "admin") {
    // Redirect to login with a message
    return <Navigate to="/login?message=admin_required" replace />;
  }

  return children;
};

export default AdminRoute;
