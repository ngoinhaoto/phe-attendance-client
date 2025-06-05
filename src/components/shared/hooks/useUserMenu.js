import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../api/authService';

export default function useUserMenu() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
    // Force a page reload to ensure complete logout
    window.location.href = "/login";
  };

  const handleProfileNavigation = () => {
    handleUserMenuClose();
    navigate("/dashboard/profile");
  };

  const handleSettingsNavigation = () => {
    handleUserMenuClose();
    navigate("/dashboard/settings");
  };

  return {
    anchorEl,
    userMenuOpen,
    handleUserMenuOpen,
    handleUserMenuClose,
    handleLogout,
    handleProfileNavigation,
    handleSettingsNavigation
  };
}