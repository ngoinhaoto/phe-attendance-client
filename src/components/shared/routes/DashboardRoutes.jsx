import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Import components
import AdminDashboard from "../../admin/AdminDashboard";
import UsersList from "../../admin/UsersList";
import ClassesList from "../../admin/ClassesList";
import UserProfile from "../UserProfile";
import StudentDashboard from "../../student/StudentDashboard";
import AttendanceCheckIn from "../../student/AttendanceCheckIn";

const DashboardRoutes = ({ user }) => {
  // Redirect to login if user data is missing
  if (!user || !user.role) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case "admin":
      return <AdminRoutes />;
    case "teacher":
      return <TeacherRoutes />;
    case "student":
      return <StudentRoutes />;
    default:
      return <Navigate to="/login" />;
  }
};

const AdminRoutes = () => (
  <Routes>
    <Route path="/profile" element={<UserProfile />} />
    <Route path="/users" element={<UsersList />} />
    <Route path="/classes" element={<ClassesList />} />
    <Route path="/" element={<AdminDashboard />} />
    <Route path="*" element={<Navigate to="/dashboard" />} />
  </Routes>
);

const TeacherRoutes = () => (
  <Routes>
    <Route path="/profile" element={<UserProfile />} />
    <Route path="/classes" element={<ClassesList />} />
    <Route path="*" element={<Navigate to="/dashboard" />} />
  </Routes>
);

const StudentRoutes = () => (
  <Routes>
    <Route path="/profile" element={<UserProfile />} />
    <Route path="/attendance" element={<AttendanceCheckIn />} />
    <Route path="/" element={<StudentDashboard />} />
    <Route path="*" element={<Navigate to="/dashboard" />} />
  </Routes>
);

export default DashboardRoutes;
