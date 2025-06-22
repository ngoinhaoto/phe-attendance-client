import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";

// Custom hooks
import useStudentData from "./hooks/useStudentData";
import useFaceRegistration from "./hooks/useFaceRegistration";

// Components
import FaceRegistrationCard from "./components/FaceRegistrationCard";
import FaceRegistrationDialog from "./components/FaceRegistrationDialog";
import FaceDetailsDialog from "./components/FaceDetailsDialog";
import AttendanceStatsCards from "./components/AttendanceStatsCards";
import UpcomingSessionsList from "./components/UpcomingSessionsList";
import RecentAttendanceList from "./components/RecentAttendanceList";
import SecuritySettingsCard from "./components/SecuritySettingsCard"; // Import the new component

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Fetch student data using custom hook
  const { loading, error, classes, upcomingSessions, recentAttendance, stats } =
    useStudentData(user);

  // Face registration functionality using custom hook
  const {
    registeredFaces,
    faceRegDialogOpen,
    faceRegLoading,
    faceRegError,
    faceRegSuccess,
    selectedFace,
    detailsOpen,
    videoRef,
    canvasRef,
    openFaceRegistrationDialog,
    closeFaceRegistrationDialog,
    registerFace,
    deleteFace,
    openFaceDetails,
    setDetailsOpen,
    resetRegistration,
  } = useFaceRegistration(user);

  // For initial development, show placeholder info if no data is available
  const showPlaceholderInfo = () => {
    if (!error && classes.length === 0 && !loading) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          No class data available. This could be because:
          <ul>
            <li>You're not enrolled in any classes yet</li>
            <li>The system is still being set up</li>
            <li>There's an issue with data access</li>
          </ul>
          If this persists, please contact your administrator.
        </Alert>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Student Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {showPlaceholderInfo()}

      {/* Face Registration */}
      <FaceRegistrationCard
        registeredFaces={registeredFaces}
        openFaceRegistrationDialog={openFaceRegistrationDialog}
        openFaceDetails={openFaceDetails}
        deleteFace={deleteFace}
      />
      
      {/* Security Settings Card */}
      <SecuritySettingsCard />

      {/* Attendance Statistics */}
      <AttendanceStatsCards stats={stats} />

      {/* Upcoming Sessions */}
      <UpcomingSessionsList
        sessions={upcomingSessions}
        onCheckIn={() => navigate("/dashboard/attendance")}
      />

      {/* Recent Attendance */}
      <RecentAttendanceList attendance={recentAttendance} />

      {/* Dialogs */}
      <FaceRegistrationDialog
        open={faceRegDialogOpen}
        onClose={closeFaceRegistrationDialog}
        error={faceRegError}
        success={faceRegSuccess}
        loading={faceRegLoading}
        videoRef={videoRef}
        canvasRef={canvasRef}
        onRegister={registerFace}
        onReset={resetRegistration}
      />

      <FaceDetailsDialog
        open={detailsOpen}
        face={selectedFace}
        onClose={() => setDetailsOpen(false)}
        onDelete={deleteFace}
      />
    </Box>
  );
};

export default StudentDashboard;
