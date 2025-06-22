import React, { useState, useEffect } from "react";
import { Box, Grid, CircularProgress, Typography } from "@mui/material";
import { format, subMonths, startOfMonth } from "date-fns";
import adminService from "../../api/adminService";

// Import component files
import StatCard from "./dashboard/StatCard";
import ActivityChart from "./dashboard/ActivityChart";
import UserRoleChart from "./dashboard/UserRoleChart";
import ClassSizeChart from "./dashboard/ClassSizeChart";

const COLORS = ["#FF5722", "#2196F3", "#4CAF50", "#FFC107"];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, admins: 0, teachers: 0, students: 0 },
    classes: [],
    attendanceData: [],
    activityData: [],
  });

  const fetchMonthlyActivityData = async () => {
    try {
      const today = new Date();
      const monthlyData = [];

      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const monthStart = startOfMonth(monthDate);
        const monthLabel = format(monthDate, "MMM");
        const year = format(monthDate, "yyyy");

        const allUsers = await adminService.getUsers();
        const studentsCount = allUsers.filter(
          (user) =>
            user.role === "student" && new Date(user.created_at) <= monthDate,
        ).length;

        const allClasses = await adminService.getClasses();
        let attendanceCount = 0;

        for (const cls of allClasses) {
          const sessions = await adminService.getClassSessions(cls.id);

          const monthSessions = sessions.filter((session) => {
            const sessionDate = new Date(session.session_date);
            return (
              format(sessionDate, "yyyy-MM") === format(monthStart, "yyyy-MM")
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

        monthlyData.push({
          date: monthLabel,
          year: year,
          students: studentsCount,
          attendance: attendanceCount,
        });
      }

      return monthlyData;
    } catch (error) {
      console.error("Error fetching monthly activity data:", error);
      return [];
    }
  };

  const fetchAttendanceDistribution = async () => {
    try {
      let totalPresent = 0;
      let totalLate = 0;
      let totalAbsent = 0;

      const classes = await adminService.getClasses();

      for (const cls of classes) {
        const sessions = await adminService.getClassSessions(cls.id);

        for (const session of sessions) {
          const attendance = await adminService.getSessionAttendance(
            session.id,
          );

          totalPresent += attendance.filter(
            (record) => record.status?.toLowerCase() === "present",
          ).length;

          totalLate += attendance.filter(
            (record) => record.status?.toLowerCase() === "late",
          ).length;

          totalAbsent += attendance.filter(
            (record) => record.status?.toLowerCase() === "absent",
          ).length;
        }
      }

      const total = totalPresent + totalLate + totalAbsent;
      if (total === 0)
        return [
          { name: "Present", value: 0 },
          { name: "Late", value: 0 },
          { name: "Absent", value: 0 },
        ];

      return [
        { name: "Present", value: totalPresent },
        { name: "Late", value: totalLate },
        { name: "Absent", value: totalAbsent },
      ];
    } catch (error) {
      console.error("Error fetching attendance distribution:", error);
      return [
        { name: "Present", value: 0 },
        { name: "Absent", value: 0 },
      ];
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
      console.error("Error getting class sizes:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users
        const users = await adminService.getUsers();
        const admins = users.filter((user) => user.role === "admin").length;
        const teachers = users.filter((user) => user.role === "teacher").length;
        const students = users.filter((user) => user.role === "student").length;

        // Fetch classes with proper student counts
        const classes = await adminService.getClasses();
        const classesWithSizes = await getClassesWithStudentCounts();

        // Fetch real attendance data
        const attendanceData = await fetchAttendanceDistribution();

        // Fetch real monthly activity data
        const activityData = await fetchMonthlyActivityData();

        setStats({
          users: { total: users.length, admins, teachers, students },
          classes,
          classesWithSizes,
          attendanceData,
          activityData,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
          background: "linear-gradient(45deg, #FF5722 0%, #FF8A65 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "inline-block",
        }}
      >
        Admin Dashboard
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={10} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard card={card} />
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
          <ClassSizeChart data={stats.classesWithSizes} colors={COLORS} />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
