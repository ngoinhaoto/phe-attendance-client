import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Check as PresentIcon,
  Close as AbsentIcon,
  Schedule as LateIcon,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import adminService from "../../../api/adminService";

const ClassAttendanceSummary = ({ open, classData, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});

  useEffect(() => {
    if (open && classData) {
      fetchData();
    }
  }, [open, classData]);

  const fetchData = async () => {
    if (!classData) return;

    try {
      setLoading(true);
      setError("");

      // 1. Get all sessions for this class
      const sessionsData = await adminService.getClassSessions(classData.id);
      setSessions(sessionsData || []);

      // 2. Get all students in this class
      const studentsData = await adminService.getClassStudents(classData.id);
      setStudents(studentsData || []);

      // 3. Get attendance for each session
      const attendanceData = {};

      for (const session of sessionsData) {
        const sessionAttendance = await adminService.getSessionAttendance(
          session.id,
        );

        // Create a map of student_id -> attendance status for this session
        const studentAttendanceMap = {};
        sessionAttendance.forEach((record) => {
          studentAttendanceMap[record.student_id] = {
            status: record.status,
            lateMinutes: record.late_minutes || 0,
            checkInTime: record.check_in_time,
          };
        });

        attendanceData[session.id] = studentAttendanceMap;
      }

      setAttendanceMap(attendanceData);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return format(parseISO(dateStr), "MMM d, yyyy");
    } catch (error) {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      return format(parseISO(timeStr), "h:mm a");
    } catch (error) {
      return timeStr;
    }
  };

  const getAttendanceStatus = (studentId, sessionId) => {
    const sessionAttendance = attendanceMap[sessionId];
    if (!sessionAttendance) return null;

    const studentAttendance = sessionAttendance[studentId];
    if (!studentAttendance) return null;

    return studentAttendance;
  };

  const getStatusChip = (status, lateMinutes) => {
    switch (status?.toLowerCase()) {
      case "present":
        return (
          <Chip
            icon={<PresentIcon />}
            label="Present"
            color="success"
            size="small"
          />
        );
      case "late":
        return (
          <Tooltip title={`${lateMinutes} minutes late`}>
            <Chip
              icon={<LateIcon />}
              label="Late"
              color="warning"
              size="small"
            />
          </Tooltip>
        );
      case "absent":
        return (
          <Chip
            icon={<AbsentIcon />}
            label="Absent"
            color="error"
            size="small"
          />
        );
      default:
        return <Chip label="Unknown" size="small" />;
    }
  };

  // Calculate student attendance rate
  const getStudentAttendanceStats = (studentId) => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let total = 0;

    sortedSessions.forEach((session) => {
      const attendance = getAttendanceStatus(studentId, session.id);
      if (attendance) {
        total++;
        if (attendance.status?.toLowerCase() === "present") present++;
        else if (attendance.status?.toLowerCase() === "late") late++;
        else if (attendance.status?.toLowerCase() === "absent") absent++;
      }
    });

    return {
      present,
      late,
      absent,
      total,
      attendanceRate:
        total > 0 ? (((present + late) / total) * 100).toFixed(1) : 0,
    };
  };

  // Calculate session attendance rate
  const getSessionAttendanceStats = (sessionId) => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let total = 0;

    students.forEach((student) => {
      const attendance = getAttendanceStatus(student.id, sessionId);
      if (attendance) {
        total++;
        if (attendance.status?.toLowerCase() === "present") present++;
        else if (attendance.status?.toLowerCase() === "late") late++;
        else if (attendance.status?.toLowerCase() === "absent") absent++;
      }
    });

    return {
      present,
      late,
      absent,
      total,
      attendanceRate:
        total > 0 ? (((present + late) / total) * 100).toFixed(1) : 0,
    };
  };

  // Sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(a.session_date) - new Date(b.session_date);
  });

  if (!classData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Attendance Summary for {classData.name} ({classData.class_code})
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            This table shows attendance status for each student across all
            sessions.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 180 }}>
                    Student
                  </TableCell>
                  {sortedSessions.map((session) => (
                    <TableCell
                      key={session.id}
                      align="center"
                      sx={{ minWidth: 100 }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {formatDate(session.session_date)}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {formatTime(session.start_time)}
                      </Typography>
                      {/* Add session stats */}
                      {!loading && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" display="block">
                            {(() => {
                              const stats = getSessionAttendanceStats(
                                session.id,
                              );
                              return `${stats.attendanceRate}% Attendance`;
                            })()}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", minWidth: 100 }}
                  >
                    Summary
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => {
                  // Get student stats for row color
                  const studentStats = getStudentAttendanceStats(student.id);
                  const rowColor =
                    studentStats.attendanceRate < 70
                      ? "rgba(255, 0, 0, 0.05)"
                      : studentStats.late > 3
                      ? "rgba(255, 165, 0, 0.05)"
                      : "rgba(0, 255, 0, 0.05)";

                  return (
                    <TableRow
                      key={student.id}
                      sx={{ backgroundColor: rowColor }}
                    >
                      <TableCell>
                        <Typography variant="body2">
                          {student.full_name || student.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.student_id || ""}
                        </Typography>
                      </TableCell>
                      {sortedSessions.map((session) => {
                        const attendance = getAttendanceStatus(
                          student.id,
                          session.id,
                        );
                        return (
                          <TableCell
                            key={`${student.id}-${session.id}`}
                            align="center"
                          >
                            {attendance ? (
                              getStatusChip(
                                attendance.status,
                                attendance.lateMinutes,
                              )
                            ) : (
                              <Chip
                                label="Not Recorded"
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                        );
                      })}
                      {/* Add summary cell */}
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {studentStats.attendanceRate}%
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            justifyContent: "center",
                            mt: 0.5,
                          }}
                        >
                          <Chip
                            label={`P: ${studentStats.present}`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                          <Chip
                            label={`L: ${studentStats.late}`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                          <Chip
                            label={`A: ${studentStats.absent}`}
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassAttendanceSummary;
