import React from 'react';
import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Typography,
  IconButton,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from "@mui/icons-material";
import useUserMenu from '../hooks/useUserMenu';

const UserMenu = ({ user, roleGradient }) => {
  const {
    anchorEl,
    userMenuOpen,
    handleUserMenuOpen,
    handleUserMenuClose,
    handleLogout,
    handleProfileNavigation,
    handleSettingsNavigation
  } = useUserMenu();

  return (
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
        <MenuItem onClick={handleProfileNavigation}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleSettingsNavigation}>
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
  );
};

export default UserMenu;