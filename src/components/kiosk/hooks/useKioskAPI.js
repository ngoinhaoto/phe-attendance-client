import { useCallback, useRef } from "react";
import apiService from "../../../api/apiService";
import adminService from "../../../api/adminService";
import { isSessionValid } from "../../../utils/dateUtils";

export default function useKioskAPI({
  setLoadingClasses,
  setClasses,
  setErrorMessage,
  setLoadingSessions,
  setSessions,
  setLoadingSession,
  setSessionInfo,
  navigate,
  setStatus,
  setRecentCheckins, // Add this parameter
  setFullAttendance, // Add this
}) {
  // Teacher cache to avoid refetching teacher info
  const teacherCache = useRef({});

  // Fetch available classes - now uses admin endpoint directly
  const fetchClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      setErrorMessage("");

      // Since this is admin-only now, use the admin service directly
      const classesData = await adminService.getClasses();

      if (Array.isArray(classesData)) {
        setClasses(classesData);
        console.log("Fetched admin classes:", classesData.length);
      } else {
        console.error("Unexpected classes data format:", classesData);
        setClasses([]);
        setErrorMessage("Error loading classes: Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setErrorMessage(
        `Could not load classes: ${error.message || "Unknown error"}`,
      );
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, [setLoadingClasses, setClasses, setErrorMessage]);

  // Fetch sessions for a selected class
  const fetchSessionsForClass = useCallback(
    async (classId) => {
      if (!classId) return;

      try {
        setLoadingSessions(true);
        setErrorMessage("");

        const sessionsData = await adminService.getClassSessions(classId);

        if (!Array.isArray(sessionsData)) {
          console.error("Invalid sessions data format:", sessionsData);
          setSessions([]);
          setErrorMessage("Error loading sessions: Invalid data format");
          return;
        }

        // Filter to only show today's ACTIVE or UPCOMING sessions
        const now = new Date();
        const todayStr = now.toDateString();

        const validSessions = sessionsData.filter((session) => {
          if (!session.session_date) return false;

          // Check if session is today
          const sessionDate = new Date(session.session_date);
          if (sessionDate.toDateString() !== todayStr) return false;

          // Check if session hasn't ended yet
          const endTime = new Date(session.end_time);
          if (endTime < now) {
            console.log(
              `Filtered out ended session ${
                session.id
              } (ended at ${endTime.toLocaleTimeString()})`,
            );
            return false;
          }

          return true;
        });

        // Sort by start time
        validSessions.sort(
          (a, b) => new Date(a.start_time) - new Date(b.start_time),
        );

        console.log(`Found ${validSessions.length} valid sessions for today`);
        setSessions(validSessions);

        // If no sessions found, show a message
        if (validSessions.length === 0) {
          setErrorMessage("No active or upcoming sessions available for today");
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setErrorMessage(
          `Could not load sessions: ${error.message || "Unknown error"}`,
        );
        setSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    },
    [setLoadingSessions, setSessions, setErrorMessage],
  );

  // Fetch session info
  const fetchSessionInfo = useCallback(
    async (sessionId) => {
      if (!sessionId) return;

      try {
        setLoadingSession(true);
        setErrorMessage("");

        const response = await apiService.get(`/classes/sessions/${sessionId}`);

        if (!response.data || !response.data.id) {
          setErrorMessage("Invalid session data received");
          setSessionInfo(null);
          return;
        }

        const session = response.data;

        // Check if session is still valid (not ended)
        if (!isSessionValid(session)) {
          setErrorMessage("This session has already ended");
          setSessionInfo(null);
          navigate(`/kiosk/class/${session.class_id}`, { replace: true });
          return;
        }

        // Fetch class details to get teacher information
        if (session.class_id) {
          try {
            console.log(
              `Fetching class details for class ID: ${session.class_id}`,
            );
            const classResponse = await apiService.get(
              `/classes/${session.class_id}`,
            );

            if (classResponse.data) {
              // Set class name and location
              session.class_name = classResponse.data.name;
              session.location =
                classResponse.data.location || "No location specified";

              // Get teacher information from class data
              if (classResponse.data.teacher) {
                // If we have a teacher object with the class
                session.teacher_name =
                  classResponse.data.teacher.full_name ||
                  classResponse.data.teacher.username;
              } else if (classResponse.data.teacher_id) {
                // If we only have teacher_id, check the cache first
                if (teacherCache.current[classResponse.data.teacher_id]) {
                  session.teacher_name =
                    teacherCache.current[classResponse.data.teacher_id];
                } else {
                  try {
                    const teacherResponse = await apiService.get(
                      `/users/${classResponse.data.teacher_id}`,
                    );
                    if (teacherResponse.data) {
                      const teacherName =
                        teacherResponse.data.full_name ||
                        teacherResponse.data.username;
                      session.teacher_name = teacherName;
                      // Cache the result
                      teacherCache.current[classResponse.data.teacher_id] =
                        teacherName;
                    } else {
                      session.teacher_name =
                        "Teacher: " + classResponse.data.teacher_id;
                    }
                  } catch (err) {
                    console.warn(
                      `Failed to fetch teacher with ID ${classResponse.data.teacher_id}:`,
                      err,
                    );
                    session.teacher_name =
                      "Teacher: " + classResponse.data.teacher_id;
                  }
                }
              }
            }
          } catch (err) {
            console.error("Failed to fetch class details:", err);
          }
        }

        setSessionInfo(session);

        // After setting the session info, fetch the attendance records for this session
        try {
          const attendanceResponse = await apiService.get(
            `/attendance/sessions/${sessionId}/students`,
          );

          if (Array.isArray(attendanceResponse.data)) {
            console.log(
              "Attendance records from API:",
              attendanceResponse.data,
            );

            // Transform attendance records to match the expected format for recentCheckins
            const checkins = attendanceResponse.data
              .filter((record) => {
                // Only include students who have actually checked in
                return record.check_in_time != null;
              })
              .map((record) => ({
                id: record.student_id,
                name:
                  record.full_name ||
                  record.student_name ||
                  record.user?.full_name ||
                  record.username ||
                  "Unknown Student",
                time: record.check_in_time
                  ? new Date(record.check_in_time).toLocaleTimeString()
                  : "Unknown",
                status: record.status,
                lateMinutes: record.late_minutes || 0,
              }));

            checkins.sort((a, b) => {
              const timeA = new Date(a.time);
              const timeB = new Date(b.time);

              const validTimeA = isNaN(timeA) ? new Date(0) : timeA;
              const validTimeB = isNaN(timeB) ? new Date(0) : timeB;

              return validTimeB - validTimeA;
            });

            console.log("Processed checkins for UI:", checkins);

            // Update the recentCheckins state
            setRecentCheckins(checkins);

            // Process all attendance data (including absent students)
            const allAttendance = attendanceResponse.data.map((record) => ({
              id: record.student_id,
              name:
                record.full_name ||
                record.student_name ||
                record.user?.full_name ||
                record.username ||
                "Unknown Student",
              time: record.check_in_time
                ? new Date(record.check_in_time).toLocaleTimeString()
                : "Not checked in",
              status: record.status,
              lateMinutes: record.late_minutes || 0,
            }));

            // Sort by status (present first, then late, then absent)
            allAttendance.sort((a, b) => {
              // First sort by status priority
              const statusOrder = { present: 1, late: 2, absent: 3 };
              const statusDiff =
                statusOrder[a.status.toLowerCase()] -
                statusOrder[b.status.toLowerCase()];

              if (statusDiff !== 0) return statusDiff;

              // If same status, sort by check-in time (recent first) for present/late
              if (a.status.toLowerCase() !== "absent") {
                const timeA = new Date(a.time);
                const timeB = new Date(b.time);
                return timeB - timeA;
              }

              // For absent students, sort alphabetically
              return a.name.localeCompare(b.name);
            });

            // Update full attendance
            setFullAttendance(allAttendance);
          }
        } catch (error) {
          console.error("Failed to fetch attendance records:", error);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setErrorMessage(
          `Could not load session: ${error.message || "Unknown error"}`,
        );
        setSessionInfo(null);
        setStatus("error");
      } finally {
        setLoadingSession(false);
      }
    },
    [setLoadingSession, setSessionInfo, setErrorMessage, navigate, setStatus],
  );

  return {
    fetchClasses,
    fetchSessionsForClass,
    fetchSessionInfo,
  };
}
