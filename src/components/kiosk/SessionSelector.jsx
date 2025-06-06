import React from "react";
import { CircularProgress, Box, Typography, Chip, Button } from "@mui/material";
import {
  LocationOn,
  Person,
  Event,
  AccessTime,
  ArrowBack,
} from "@mui/icons-material";

const SessionSelector = ({
  loadingClasses,
  loadingSessions,
  classes,
  sessions,
  selectedClassId,
  selectedSessionId,
  handleClassChange,
  handleSessionChange,
  formatTime,
}) => {
  // Function to go back to class selection
  const goBackToClassSelection = () => {
    handleClassChange({ target: { value: "" } });
  };

  return (
    <div className="session-selector">
      {/* Class Selector */}
      <div className="select-container">
        {selectedClassId ? (
          // When a class is selected, show class name and back button
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Selected Class:{" "}
              {classes.find((c) => c.id.toString() === selectedClassId)?.name ||
                `Class #${selectedClassId}`}
            </Typography>

            <Button
              startIcon={<ArrowBack />}
              onClick={goBackToClassSelection}
              variant="outlined"
              size="small"
            >
              Back to Class Selection
            </Button>
          </Box>
        ) : (
          // Original class selector dropdown
          <>
            <label htmlFor="class-select">Select Class:</label>
            {loadingClasses ? (
              <div className="loading-indicator">
                <CircularProgress size={24} />
                <span>Loading classes...</span>
              </div>
            ) : (
              <select
                id="class-select"
                value={selectedClassId}
                onChange={handleClassChange}
                disabled={loadingClasses}
              >
                <option value="">-- Select a class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.class_code}) -{" "}
                    {cls.teacher?.full_name || "No teacher assigned"}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        {selectedClassId && classes.length > 0 && (
          <ClassDetailsCard
            classData={classes.find(
              (c) => c.id.toString() === selectedClassId.toString(),
            )}
          />
        )}
      </div>

      {/* Session Selector - Only show if a class is selected */}
      {selectedClassId && (
        <div className="select-container">
          <label htmlFor="session-select">Select Session:</label>
          {loadingSessions ? (
            <div className="loading-indicator">
              <CircularProgress size={24} />
              <span>Loading sessions...</span>
            </div>
          ) : (
            <>
              <select
                id="session-select"
                value={selectedSessionId}
                onChange={handleSessionChange}
                disabled={loadingSessions || sessions.length === 0}
              >
                <option value="">-- Select a session --</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {formatTime(session.start_time)} -{" "}
                    {formatTime(session.end_time)}
                  </option>
                ))}
              </select>

              {selectedSessionId && sessions.length > 0 && (
                <SessionDetailsCard
                  session={sessions.find(
                    (s) => s.id.toString() === selectedSessionId.toString(),
                  )}
                  formatTime={formatTime}
                />
              )}

              {sessions.length === 0 && selectedClassId && !loadingSessions && (
                <p className="info-message">No sessions available for today</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Helper component to show class details
const ClassDetailsCard = ({ classData }) => {
  if (!classData) return null;

  return (
    <Box className="details-card">
      <Typography variant="subtitle1" fontWeight="bold">
        {classData.name}
      </Typography>
      <Box className="details-row">
        <Typography variant="body2">Code: {classData.class_code}</Typography>
        {classData.semester && classData.academic_year && (
          <Typography variant="body2">
            {classData.semester} {classData.academic_year}
          </Typography>
        )}
      </Box>

      {classData.location && (
        <Box className="details-row">
          <LocationOn fontSize="small" />
          <Typography variant="body2">{classData.location}</Typography>
        </Box>
      )}

      <Box className="details-row">
        <Person fontSize="small" />
        <Typography variant="body2">
          {classData.teacher?.full_name ||
            classData.teacher?.username ||
            "No teacher assigned"}
        </Typography>
      </Box>

      {classData.description && (
        <Typography variant="body2" className="class-description">
          {classData.description}
        </Typography>
      )}
    </Box>
  );
};

// Helper component to show session details
const SessionDetailsCard = ({ session, formatTime }) => {
  if (!session) return null;

  const isActive = () => {
    const now = new Date();
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    return now >= startTime && now <= endTime;
  };

  return (
    <Box className="details-card">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Session Details
        </Typography>
        <Chip
          label={isActive() ? "Active Now" : "Upcoming"}
          color={isActive() ? "success" : "primary"}
          size="small"
        />
      </Box>

      <Box className="details-row">
        <Event fontSize="small" />
        <Typography variant="body2">
          {new Date(session.session_date).toLocaleDateString()}
        </Typography>
      </Box>

      <Box className="details-row">
        <AccessTime fontSize="small" />
        <Typography variant="body2">
          {formatTime(session.start_time)} - {formatTime(session.end_time)}
        </Typography>
      </Box>

      {session.location && (
        <Box className="details-row">
          <LocationOn fontSize="small" />
          <Typography variant="body2">{session.location}</Typography>
        </Box>
      )}

      {session.notes && (
        <Typography variant="body2" className="session-notes">
          Notes: {session.notes}
        </Typography>
      )}
    </Box>
  );
};

export default SessionSelector;
