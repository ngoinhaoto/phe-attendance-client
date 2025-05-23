import React, { useState, useEffect } from "react";
import { Box, Grid, Paper, Typography, CircularProgress } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import adminService from "../../api/adminService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, admins: 0, teachers: 0, students: 0 },
    classes: [],
    attendanceData: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users
        const users = await adminService.getUsers();
        const admins = users.filter((user) => user.role === "admin").length;
        const teachers = users.filter((user) => user.role === "teacher").length;
        const students = users.filter((user) => user.role === "student").length;

        // Fetch classes
        const classes = await adminService.getClasses();

        // Simple attendance data (would need to be refined based on your API)
        // This is placeholder data - you'll need to adapt it to your actual API response
        const attendanceData = [
          { name: "Present", value: 85 },
          { name: "Absent", value: 15 },
        ];

        setStats({
          users: { total: users.length, admins, teachers, students },
          classes,
          attendanceData,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Data for user role distribution
  const userRoleData = [
    { name: "Admins", value: stats.users.admins },
    { name: "Teachers", value: stats.users.teachers },
    { name: "Students", value: stats.users.students },
  ];

  // Data for classes - FIXED: Handle the case where students might not exist
  const classData = stats.classes
    .map((cls) => ({
      name: cls.name || "Unnamed Class",
      students: cls.students?.length || 0, // Safely access students property
    }))
    .slice(0, 5); // Only show top 5 classes

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* User statistics */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Total Users
            </Typography>
            <Typography component="p" variant="h4">
              {stats.users.total}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Total Classes
            </Typography>
            <Typography component="p" variant="h4">
              {stats.classes.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Students
            </Typography>
            <Typography component="p" variant="h4">
              {stats.users.students}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Teachers
            </Typography>
            <Typography component="p" variant="h4">
              {stats.users.teachers}
            </Typography>
          </Paper>
        </Grid>

        {/* User role distribution chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 300 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              User Role Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Class size chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 300 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Classes by Size
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
