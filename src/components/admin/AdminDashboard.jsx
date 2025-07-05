import React, { useState, useEffect } from "react";
import { Box, Grid, CircularProgress, Typography } from "@mui/material";
import {
  format,
  subMonths,
  startOfMonth,
  parseISO,
  isWithinInterval,
  endOfMonth,
} from "date-fns";
import adminService from "../../api/adminService";

// Import component files
import StatCard from "./dashboard/StatCard";
import ActivityChart from "./dashboard/ActivityChart";
import UserRoleChart from "./dashboard/UserRoleChart";
import ClassSizeChart from "./dashboard/ClassSizeChart";
import DateRangePicker from "./dashboard/DateRangePicker";

const COLORS = ["#FF5722", "#2196F3", "#4CAF50", "#FFC107"];

const ADMIN_GRADIENT = "linear-gradient(135deg, #E1A6B8 0%, #7C6FC4 100%)";
const ADMIN_GRADIENT_TEXT = {
  background: ADMIN_GRADIENT,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  display: "inline-block",
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: subMonths(new Date(), 5), // Default to 5 months (semester)
    endDate: new Date(),
  });
  const [stats, setStats] = useState({
    users: { total: 0, admins: 0, teachers: 0, students: 0 },
    classes: [],
    attendanceData: [],
    activityData: [],
  });

  const handleDateRangeChange = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
  };

  const fetchMonthlyActivityData = async (startDate, endDate) => {
    try {
      const monthsArray = [];
      let currentDate = new Date(startDate);

      // Generate an array of months between startDate and endDate
      while (currentDate <= endDate) {
        monthsArray.push({
          date: format(currentDate, "MMM"),
          year: format(currentDate, "yyyy"),
          month: currentDate.getMonth(),
          fullYear: currentDate.getFullYear(),
        });
        currentDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1,
        );
      }

      const allUsers = await adminService.getUsers();
      const allClasses = await adminService.getClasses();

      // Process data for each month
      const monthlyData = await Promise.all(
        monthsArray.map(async (monthInfo) => {
          const monthDate = new Date(monthInfo.fullYear, monthInfo.month, 1);
          const monthEnd = endOfMonth(monthDate);

          // Count students created by this month
          const studentsCount = allUsers.filter(
            (user) =>
              user.role === "student" && new Date(user.created_at) <= monthEnd,
          ).length;

          // Get attendance for this month
          let attendanceCount = 0;
          for (const cls of allClasses) {
            const sessions = await adminService.getClassSessions(cls.id);

            const monthSessions = sessions.filter((session) => {
              const sessionDate = new Date(session.session_date);
              return (
                format(sessionDate, "yyyy-MM") === format(monthDate, "yyyy-MM")
              );
            });

            for (const session of monthSessions) {
              const attendance = await adminService.getSessionAttendance(
                session.id,
              );

              const presentAndLate = attendance.filter(
                (record) =>
                  record.status?.toLowerCase() === "present" ||
                  record.status?.toLowerCase() === "late",
              ).length;

              attendanceCount += presentAndLate;
            }
          }

          return {
            ...monthInfo,
            students: studentsCount,
            attendance: attendanceCount,
          };
        }),
      );

      return monthlyData;
    } catch (error) {
      console.error("Error fetching monthly activity data:", error);
      return [];
    }
  };

  // Function to properly get class sizes
  const getClassesWithStudentCounts = async () => {
    try {
      const classes = await adminService.getClasses();

      // For each class, get the actual student count
      const classesWithStudentCounts = await Promise.all(
        classes.map(async (cls) => {
          // Use the dedicated endpoint to get students for this class
          const students = await adminService.getClassStudents(cls.id);
          return {
            id: cls.id,
            name: cls.name || "Unnamed Class",
            students: students.length,
          };
        }),
      );

      // Sort by student count and take top 5
      return classesWithStudentCounts
        .sort((a, b) => b.students - a.students)
        .slice(0, 5);
    } catch (error) {
      console.error("Error fetching class sizes:", error);
      return [];
    }
  };

  useEffect(() => {
    // Add a request ID to prevent duplicate calls
    const requestId = Math.random().toString(36).substring(7);
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Use the new consolidated endpoint
        const dashboardData = await adminService.getDashboardData(dateRange);

        if (isMounted) {
          setStats({
            users: dashboardData?.users || {
              total: 0,
              admins: 0,
              teachers: 0,
              students: 0,
            },
            classes: dashboardData?.classes || [],
            activityData: dashboardData?.activityData || [],
            classesWithSizes: dashboardData?.classesWithSizes || [],
          });
        }
      } catch (error) {
        console.error(`Error fetching dashboard data (${requestId}):`, error);
        // Initialize with empty data on error
        if (isMounted) {
          setStats({
            users: { total: 0, admins: 0, teachers: 0, students: 0 },
            classes: [],
            activityData: [],
            classesWithSizes: [],
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    console.log(`Starting dashboard data fetch (${requestId})`);
    fetchData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      console.log(`Canceled dashboard data fetch (${requestId})`);
    };
  }, [dateRange.startDate, dateRange.endDate]);

  // Define stat cards data
  const statCards = [
    {
      title: "Total Users",
      value: stats.users.total,
      icon: "people",
      color: "#FF5722",
    },
    {
      title: "Total Classes",
      value: stats.classes.length,
      icon: "class",
      color: "#2196F3",
    },
    {
      title: "Students",
      value: stats.users.students,
      icon: "school",
      color: "#4CAF50",
    },
    {
      title: "Teachers",
      value: stats.users.teachers,
      icon: "teacher",
      color: "#FFC107",
    },
  ];

  // Define user role data for the pie chart
  const userRoleData = [
    { name: "Admins", value: stats.users.admins },
    { name: "Teachers", value: stats.users.teachers },
    { name: "Students", value: stats.users.students },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: "bold",
          ...ADMIN_GRADIENT_TEXT, // Use the gradient text style
        }}
      >
        Admin Dashboard
      </Typography>

      {/* Date Range Picker */}
      <Box sx={{ mb: 4 }}>
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={handleDateRangeChange}
        />
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={10} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={card.title}
              value={card.value}
              color={card.color}
              icon={card.icon}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6 }}>
        {/* Flex container for charts */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            mb: 4,
          }}
        >
          {/* Activity Chart */}
          <Box
            sx={{
              flex: "1 1 600px",
              minHeight: { xs: 400, md: 550 },
            }}
          >
            <ActivityChart data={stats.activityData} colors={COLORS} />
          </Box>

          {/* User Role Distribution Chart */}
          <Box
            sx={{
              flex: "1 1 400px",
              minHeight: { xs: 400, md: 550 },
            }}
          >
            <UserRoleChart data={userRoleData} colors={COLORS} />
          </Box>
        </Box>

        {/* Class Size Chart - Full width but smaller height */}
        <Box sx={{ mb: 4 }}>
          <ClassSizeChart data={stats.classesWithSizes || []} colors={COLORS} />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
