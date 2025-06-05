import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Badge,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationIcon
} from "@mui/icons-material";
import UserMenu from './UserMenu';
import { Link } from 'react-router-dom';
import CameraIcon from '@mui/icons-material/Camera';

const AppHeader = ({ user, open, roleColors, toggleDrawer }) => {
  const roleGradient = `linear-gradient(135deg, ${roleColors[0]} 0%, ${roleColors[1]} 100%)`;

  return (
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
        {user ? (
          <UserMenu user={user} roleGradient={roleGradient} />
        ) : (
          <Button 
            color="inherit" 
            component={Link} 
            to="/kiosk" 
            startIcon={<CameraIcon />}
            sx={{ ml: 2 }}
          >
            Attendance Kiosk
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;