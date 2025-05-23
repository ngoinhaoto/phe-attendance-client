import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Class as ClassIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

// Import admin components
import AdminDashboard from "../admin/AdminDashboard";
import UsersList from "../admin/UsersList";
import ClassesList from "../admin/ClassesList";
import UserProfile from "./UserProfile";

// Import other role components
// import StudentDashboard from "../student/StudentDashboard";
// import TeacherDashboard from "../teacher/TeacherDashboard";

import authService from "../../api/authService";

const drawerWidth = 240;

const Dashboard = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);
  const { user } = useSelector((state) => state.auth);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // Get menu items based on user role
  const getMenuItems = () => {
    const commonMenuItems = [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
      { text: "My Profile", icon: <PersonIcon />, path: "/dashboard/profile" },
    ];

    if (user?.role === "admin") {
      return [
        ...commonMenuItems,
        { text: "Users", icon: <PeopleIcon />, path: "/dashboard/users" },
        { text: "Classes", icon: <ClassIcon />, path: "/dashboard/classes" },
      ];
    } else if (user?.role === "teacher") {
      return [
        ...commonMenuItems,
        { text: "My Classes", icon: <ClassIcon />, path: "/dashboard/classes" },
      ];
    } else {
      // Student role
      return [
        ...commonMenuItems,
        {
          text: "My Attendance",
          icon: <ClassIcon />,
          path: "/dashboard/attendance",
        },
      ];
    }
  };

  // Render the correct dashboard based on user role
  const renderDashboardContent = () => {
    if (user?.role === "admin") {
      console.log("Rendering admin dashboard"); // Debug admin view
      return (
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/classes" element={<ClassesList />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      );
    } else if (user?.role === "teacher") {
      return (
        <Routes>
          <Route path="/profile" element={<UserProfile />} />
          {/* <Route path="/" element={<TeacherDashboard />} /> */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      );
    } else {
      // Student role
      return (
        <Routes>
          <Route path="/profile" element={<UserProfile />} />
          {/* <Route path="/" element={<StudentDashboard />} /> */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      );
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ marginRight: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Face Attendance System
          </Typography>

          {user && (
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {user.username}
              </Typography>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor:
                    user.role === "admin"
                      ? "#f44336"
                      : user.role === "teacher"
                      ? "#1976d2"
                      : "#4caf50",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/dashboard/profile")}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          )}

          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", mt: 2 }}>
          <List>
            {getMenuItems().map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {renderDashboardContent()}
      </Box>
    </Box>
  );
};

export default Dashboard;
