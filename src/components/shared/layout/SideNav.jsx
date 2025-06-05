import React from 'react';
import {
  Drawer,
  Toolbar,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography
} from '@mui/material';
import { Logout as LogoutIcon } from "@mui/icons-material";
import authService from "../../../api/authService";
import { useNavigate } from "react-router-dom";

const SideNav = ({
  user,
  open,
  drawerWidth,
  isMobile,
  toggleDrawer,
  menuItems,
  handleNavigation,
  isActive,
  roleColors
}) => {
  const navigate = useNavigate();
  const roleGradient = `linear-gradient(135deg, ${roleColors[0]} 0%, ${roleColors[1]} 100%)`;

  const handleLogout = () => {
    authService.logout();
    // Force a page reload which will redirect to login due to PrivateRoute
    window.location.href = "/login";
  };

  return (
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
          borderRadius: "0px",
        },
      }}
    >
      <Toolbar
        sx={{
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          background: "rgba(255,255,255,0.5)",
        }}
      />
      <Box sx={{ overflow: "auto", mt: 2, px: 2 }}>
        {user && (
          <UserProfile user={user} roleGradient={roleGradient} />
        )}

        <Divider sx={{ mx: -2, mb: 2 }} />

        <NavigationList 
          items={menuItems} 
          handleNavigation={handleNavigation} 
          isActive={isActive} 
          roleColors={roleColors}
        />

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
  );
};

// User profile component for sidebar
const UserProfile = ({ user, roleGradient }) => (
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
);

// Navigation list component
const NavigationList = ({ items, handleNavigation, isActive, roleColors }) => (
  <List sx={{ px: 0 }}>
    {items.map((item) => (
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
          onClick={() => handleNavigation(item.path)}
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
);

export default SideNav;