import React from "react";
import KioskExitDialog from "./KioskExitDialog";
import { Snackbar, Alert, Box, Chip, Typography } from "@mui/material";
import {
  LocationOn as LocationIcon,
  Person as TeacherIcon,
  Event as DateIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

const KioskHeader = ({
  kioskMode,
  enableKioskMode,
  disableKioskMode,
  navigate,
  sessionInfo,
  formatDate,
  formatTime,
  user,
  showBlockedNavAlert,
  setShowBlockedNavAlert,
  selectedClassId,
  classes,
}) => {
  return (
    <header className="kiosk-header">
      <h1>Attendance Check-In Kiosk</h1>

      {!kioskMode ? (
        <div className="admin-controls">
          <button className="kiosk-mode-button" onClick={enableKioskMode}>
            Enter Kiosk Mode
          </button>
          <button
            className="dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <KioskExitDialog onExit={disableKioskMode} />
      )}

      {sessionInfo ? (
        <div className="session-info-detailed">
          <h2>{sessionInfo.class_name || "Class Session"}</h2>

          <Box className="session-details">
            <Box className="detail-item">
              <DateIcon fontSize="small" />
              <Typography variant="body1">
                {formatDate(sessionInfo.session_date)}
              </Typography>
            </Box>

            <Box className="detail-item">
              <TimeIcon fontSize="small" />
              <Typography variant="body1">
                {formatTime(sessionInfo.start_time)} -{" "}
                {formatTime(sessionInfo.end_time)}
              </Typography>
            </Box>

            {sessionInfo.location && (
              <Box className="detail-item">
                <LocationIcon fontSize="small" />
                <Typography variant="body1">{sessionInfo.location}</Typography>
              </Box>
            )}

            {/* Display teacher information */}
            {(sessionInfo.teacher_name || sessionInfo.teacher_id) && (
              <Box className="detail-item">
                <TeacherIcon fontSize="small" />
                <Typography variant="body1">
                  {sessionInfo.teacher_name
                    ? sessionInfo.teacher_name
                    : `Teacher ID: ${sessionInfo.teacher_id}`}
                </Typography>
              </Box>
            )}

            {sessionInfo.notes && (
              <Box className="detail-item">
                <InfoIcon fontSize="small" />
                <Typography variant="body1" className="session-notes">
                  {sessionInfo.notes}
                </Typography>
              </Box>
            )}
          </Box>

          <Box className="session-status">
            <Chip
              label={
                isSessionActive(sessionInfo)
                  ? "Active Session"
                  : "Upcoming Session"
              }
              color={isSessionActive(sessionInfo) ? "success" : "primary"}
              size="small"
            />
          </Box>
        </div>
      ) : selectedClassId ? (
        // New state: Class selected but no session selected
        <div className="session-info-intermediate">
          <h2>
            {classes.find((c) => c.id.toString() === selectedClassId)?.name ||
              `Class #${selectedClassId}`}
          </h2>
          <p>Please select a session for this class below</p>
          <Box className="class-details-brief">
            {classes.find((c) => c.id.toString() === selectedClassId)?.teacher
              ?.full_name && (
              <Box className="detail-item">
                <TeacherIcon fontSize="small" />
                <Typography variant="body1">
                  {
                    classes.find((c) => c.id.toString() === selectedClassId)
                      ?.teacher?.full_name
                  }
                </Typography>
              </Box>
            )}
            {classes.find((c) => c.id.toString() === selectedClassId)
              ?.location && (
              <Box className="detail-item">
                <LocationIcon fontSize="small" />
                <Typography variant="body1">
                  {
                    classes.find((c) => c.id.toString() === selectedClassId)
                      ?.location
                  }
                </Typography>
              </Box>
            )}
          </Box>
        </div>
      ) : (
        // Original "no selection" state
        <div className="session-info">
          <h2>No Session Selected</h2>
          <p>Please select a class and session below</p>
        </div>
      )}

      <Snackbar
        open={showBlockedNavAlert}
        autoHideDuration={6000}
        onClose={() => setShowBlockedNavAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          onClose={() => setShowBlockedNavAlert(false)}
          variant="filled"
          sx={{
            width: "100%",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          Navigation blocked in kiosk mode. Please exit kiosk mode first.
        </Alert>
      </Snackbar>
    </header>
  );
};

// Helper function to check if session is active
const isSessionActive = (session) => {
  if (!session) return false;

  const now = new Date();
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);

  return now >= startTime && now <= endTime;
};

export default KioskHeader;
