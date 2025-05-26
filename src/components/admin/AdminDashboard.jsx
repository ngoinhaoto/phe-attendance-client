import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  alpha,
} from "@mui/material";
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
  LineChart,
  Line,
} from "recharts";
import {
  PeopleAlt as PeopleIcon,
  Class as ClassIcon,
  School as SchoolIcon,
  PersonAdd as TeacherIcon,
} from "@mui/icons-material";
import adminService from "../../api/adminService";

const COLORS = ["#FF5722", "#2196F3", "#4CAF50", "#FFC107"];

const AdminDashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, admins: 0, teachers: 0, students: 0 },
    classes: [],
    attendanceData: [],
    activityData: [
      { date: "2023-01", students: 5, attendance: 40 },
      { date: "2023-02", students: 8, attendance: 55 },
      { date: "2023-03", students: 12, attendance: 70 },
      { date: "2023-04", students: 15, attendance: 90 },
      { date: "2023-05", students: 18, attendance: 110 },
    ],
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
        const attendanceData = [
          { name: "Present", value: 85 },
          { name: "Absent", value: 15 },
        ];

        setStats({
          users: { total: users.length, admins, teachers, students },
          classes,
          attendanceData,
          activityData: [
            { date: "Jan", students: 5, attendance: 40 },
            { date: "Feb", students: 8, attendance: 55 },
            { date: "Mar", students: 12, attendance: 70 },
            { date: "Apr", students: 15, attendance: 90 },
            { date: "May", students: 18, attendance: 110 },
          ],
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

  // Stat card styles
  const statCards = [
    {
      title: "Total Users",
      value: stats.users.total,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: "#FF5722",
    },
    {
      title: "Total Classes",
      value: stats.classes.length,
      icon: <ClassIcon sx={{ fontSize: 40 }} />,
      color: "#2196F3",
    },
    {
      title: "Students",
      value: stats.users.students,
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: "#4CAF50",
    },
    {
      title: "Teachers",
      value: stats.users.teachers,
      icon: <TeacherIcon sx={{ fontSize: 40 }} />,
      color: "#FFC107",
    },
  ];

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
            <Card
              sx={{
                height: "100%",
                background: `linear-gradient(135deg, ${alpha(
                  card.color,
                  0.1,
                )} 0%, ${alpha(card.color, 0.05)} 100%)`,
                border: `1px solid ${alpha(card.color, 0.1)}`,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "5px",
                  height: "100%",
                  background: card.color,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", color: card.color }}
                    >
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: alpha(card.color, 0.1),
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
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
              flex: "1 1 600px", // Allow it to grow but set a min width
              minHeight: { xs: 400, md: 550 },
            }}
          >
            <Paper
              sx={{
                p: { xs: 2, md: 3 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "visible",
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Activity Overview
              </Typography>
              <Box
                sx={{
                  flexGrow: 1,
                  height: "calc(100% - 40px)",
                  width: "100%",
                  overflow: "visible",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats.activityData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 40,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: theme.shadows[3],
                        border: "none",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke={COLORS[2]}
                      strokeWidth={3}
                      dot={{ r: 5, strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke={COLORS[1]}
                      strokeWidth={3}
                      dot={{ r: 5, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>

          {/* User Role Distribution Chart */}
          <Box
            sx={{
              flex: "1 1 400px", // Smaller min width than the activity chart
              minHeight: { xs: 400, md: 550 },
            }}
          >
            <Paper
              sx={{
                p: { xs: 2, md: 3 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "visible",
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                User Role Distribution
              </Typography>
              <Box
                sx={{
                  flexGrow: 1,
                  height: "calc(100% - 40px)",
                  width: "100%",
                  overflow: "visible",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart
                    margin={{
                      top: 20,
                      right: 20,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={120}
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
                    <Tooltip
                      contentStyle={{
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: theme.shadows[3],
                        border: "none",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Class Size Chart - Full width but smaller height */}
        <Box sx={{ mb: 4 }}>
          <Paper
            sx={{
              p: { xs: 2, md: 3 },
              height: { xs: 400, md: 450 }, // Reduced height
              display: "flex",
              flexDirection: "column",
              overflow: "visible",
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)", // Enhanced shadow
              border: "1px solid rgba(0,0,0,0.09)", // Added subtle border
              borderRadius: 3, // Slightly increased border radius
              position: "relative",
              "&:before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: "10%",
                height: "80%",
                width: "6px",
                borderRadius: "0 3px 3px 0",
                background: "linear-gradient(to bottom, #4CAF50, #2196F3)",
              },
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "bold",
                pl: 1, // Add padding to accommodate the left accent
              }}
            >
              Classes by Size
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                height: "calc(100% - 40px)",
                width: "100%",
                overflow: "visible",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    height={50}
                    tickMargin={10}
                  />
                  <YAxis
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[3],
                      border: "none",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="students"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                    background={{ fill: "#f5f5f5", radius: [4, 4, 0, 0] }}
                  >
                    {classData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
