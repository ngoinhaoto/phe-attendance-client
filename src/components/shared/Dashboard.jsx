import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
  useTheme,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  Collapse,
  Fade,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Class as ClassIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  ExpandLess,
  ExpandMore,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
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

const drawerWidth = 260;

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(location.pathname);

  const { user } = useSelector((state) => state.auth);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setUserMenuOpen(true);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    authService.logout();
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setActiveItem(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  // Get role-specific colors
  const getRoleColors = (role) => {
    switch (role) {
      case "admin":
        return ["#FF8A65", "#FF5722"]; // Orange gradient
      case "teacher":
        return ["#90CAF9", "#2196F3"]; // Blue gradient
      case "student":
        return ["#A5D6A7", "#4CAF50"]; // Green gradient
      default:
        return ["#E0E0E0", "#9E9E9E"]; // Gray gradient
    }
  };

  // Get menu items based on user role
  const getMenuItems = () => {
    const commonMenuItems = [
      {
        text: "Dashboard",
        icon: <DashboardIcon />,
        path: "/dashboard",
        exact: true,
      },
      {
        text: "My Profile",
        icon: <PersonIcon />,
        path: "/dashboard/profile",
        exact: false,
      },
    ];

    if (user?.role === "admin") {
      return [
        ...commonMenuItems,
        {
          text: "Users",
          icon: <PeopleIcon />,
          path: "/dashboard/users",
          exact: false,
        },
        {
          text: "Classes",
          icon: <ClassIcon />,
          path: "/dashboard/classes",
          exact: false,
        },
      ];
    } else if (user?.role === "teacher") {
      return [
        ...commonMenuItems,
        {
          text: "My Classes",
          icon: <ClassIcon />,
          path: "/dashboard/classes",
          exact: false,
        },
      ];
    } else {
      // Student role
      return [
        ...commonMenuItems,
        {
          text: "My Attendance",
          icon: <ClassIcon />,
          path: "/dashboard/attendance",
          exact: false,
        },
      ];
    }
  };

  // Render the correct dashboard based on user role
  const renderDashboardContent = () => {
    if (user?.role === "admin") {
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

  // Check if a menu item is active
  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }
    return location.pathname.startsWith(path) && path !== "/dashboard";
  };

  const roleColors = user ? getRoleColors(user.role) : ["#E0E0E0", "#9E9E9E"];
  const roleGradient = `linear-gradient(135deg, ${roleColors[0]} 0%, ${roleColors[1]} 100%)`;

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundImage: roleGradient,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          borderRadius: "0px 0px 20px 20px",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ marginRight: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            <img
              src="/logo192.png"
              alt=""
              style={{
                height: "30px",
                marginRight: "10px",
                display: "none", // Remove this line if you have a logo
              }}
            />
            Face Attendance System
          </Typography>

          {/* Notification Icon */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={0} color="error">
                <NotificationIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile Menu */}
          {user && (
            <Box>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleUserMenuOpen}
                  size="small"
                  sx={{ ml: 1 }}
                  aria-controls={userMenuOpen ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen ? "true" : undefined}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: roleGradient,
                      fontWeight: "bold",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      border: "2px solid rgba(255,255,255,0.8)",
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                onClick={handleUserMenuClose}
                PaperProps={{
                  elevation: 4,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                    mt: 1.5,
                    borderRadius: 2,
                    minWidth: 180,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {user.full_name || user.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleUserMenuClose();
                    navigate("/dashboard/profile");
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleUserMenuClose();
                    navigate("/dashboard/settings");
                  }}
                >
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={isMobile ? toggleDrawer : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "none",
            boxShadow: "4px 0 10px rgba(0,0,0,0.05)",
            background: "#f8f9fb",
            borderRadius: "0px", // This removes the rounded corners
          },
        }}
      >
        <Toolbar
          sx={{
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            background: "rgba(255,255,255,0.5)",
          }}
        />{" "}
        <Box sx={{ overflow: "auto", mt: 2, px: 2 }}>
          {user && (
            <Box
              sx={{
                mb: 3,
                mt: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mb: 1,
                  background: roleGradient,
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  border: "4px solid white",
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="subtitle1" fontWeight="bold">
                {user.full_name || user.username}
              </Typography>
              <Box
                sx={{
                  background: roleGradient,
                  color: "white",
                  fontSize: "0.75rem",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 5,
                  fontWeight: "medium",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  mt: 0.5,
                }}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Box>
            </Box>
          )}

          <Divider sx={{ mx: -2, mb: 2 }} />

          <List sx={{ px: 0 }}>
            {getMenuItems().map((item) => (
              <ListItem
                key={item.text}
                disablePadding
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    display: "flex",
                    width: "100%",
                    px: 2,
                    py: 1.5,
                    alignItems: "center",
                    cursor: "pointer",
                    position: "relative",
                    color: isActive(item.path) ? roleColors[1] : "text.primary",
                    backgroundColor: isActive(item.path)
                      ? "rgba(0,0,0,0.04)"
                      : "transparent",
                    borderLeft: isActive(item.path)
                      ? `4px solid ${roleColors[1]}`
                      : "4px solid transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive(item.path)
                        ? roleColors[1]
                        : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? "medium" : "regular",
                    }}
                  />
                </Box>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ mx: -2, my: 2 }} />

          <List sx={{ px: 0 }}>
            <ListItem
              disablePadding
              sx={{
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                onClick={handleLogout}
                sx={{
                  display: "flex",
                  width: "100%",
                  px: 2,
                  py: 1.5,
                  alignItems: "center",
                  cursor: "pointer",
                  color: "text.primary",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.08)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: "text.secondary",
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </Box>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 1, md: 2 }, // Reduced padding
          width: { md: `calc(100% - ${open ? drawerWidth : 0}px)` },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Fade in={true} style={{ transitionDelay: "150ms" }}>
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 3,
              p: { xs: 1, sm: 1.5, md: 2 }, // Reduced padding
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              overflow: "visible", // Changed from 'auto' to 'visible'
            }}
          >
            {renderDashboardContent()}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default Dashboard;
