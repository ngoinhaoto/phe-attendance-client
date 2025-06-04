import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../api/authService';

export default function useNavigation(isMobile, location) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(!isMobile);
  const [activeItem, setActiveItem] = useState(location.pathname);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setActiveItem(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // Check if a menu item is active
  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }
    return location.pathname.startsWith(path) && path !== "/dashboard";
  };

  return {
    open,
    toggleDrawer,
    handleNavigation,
    handleLogout,
    isActive,
    activeItem
  };
}