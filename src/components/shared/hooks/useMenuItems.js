import React from 'react';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Class as ClassIcon,
  AccountCircle
} from "@mui/icons-material";

export default function useMenuItems(user) {
  if (!user || !user.role) {
    return [];
  }

  const commonMenuItems = [
    {
      text: "Profile",
      icon: <AccountCircle />,
      path: "/dashboard/profile",
      exact: true,
    },
  ];

  if (user.role === "admin") {
    return [
      {
        text: "Dashboard",
        icon: <DashboardIcon />,
        path: "/dashboard",
        exact: true,
      },
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
  } else if (user.role === "teacher") {
    return [
      {
        text: "Dashboard",
        icon: <DashboardIcon />,
        path: "/dashboard",
        exact: true,
      },
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
      {
        text: "Dashboard",
        icon: <DashboardIcon />,
        path: "/dashboard",
        exact: true,
      },
      ...commonMenuItems,
      {
        text: "Attendance Check-In",
        icon: <ClassIcon />,
        path: "/dashboard/attendance",
        exact: false,
      },
    ];
  }
}