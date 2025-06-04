import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, CssBaseline, CircularProgress, Fade, useTheme, useMediaQuery } from "@mui/material";

// Custom hooks and components
import useNavigation from "./hooks/useNavigation";
import useMenuItems from "./hooks/useMenuItems";
import AppHeader from "./layout/AppHeader";
import SideNav from "./layout/SideNav";
import DashboardRoutes from "./routes/DashboardRoutes";

const drawerWidth = 260;

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // Custom hooks for navigation and drawer state
  const { 
    open, 
    toggleDrawer, 
    handleNavigation,
    isActive 
  } = useNavigation(isMobile, location);
  
  // Get menu items based on user role
  const menuItems = useMenuItems(user);

  // Show loading indicator while fetching user data
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Get role colors for theming
  const roleColors = getRoleColors(user?.role);
  
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      
      {/* App Header */}
      <AppHeader 
        user={user}
        open={open}
        roleColors={roleColors}
        toggleDrawer={toggleDrawer}
      />
      
      {/* Sidebar Navigation */}
      <SideNav
        user={user}
        open={open}
        drawerWidth={drawerWidth}
        isMobile={isMobile}
        toggleDrawer={toggleDrawer}
        menuItems={menuItems}
        handleNavigation={handleNavigation}
        isActive={isActive}
        roleColors={roleColors}
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 1, md: 2 },
          width: { md: `calc(100% - ${open ? drawerWidth : 0}px)` },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ height: theme.mixins.toolbar.minHeight }} /> {/* Toolbar spacer */}
        <Fade in={true} style={{ transitionDelay: "150ms" }}>
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 3,
              p: { xs: 1, sm: 1.5, md: 2 },
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              overflow: "visible",
            }}
          >
            <DashboardRoutes user={user} />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

// Helper function to get role colors
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

export default Dashboard;
