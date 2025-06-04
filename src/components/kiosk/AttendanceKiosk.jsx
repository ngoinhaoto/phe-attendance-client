import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AttendanceKiosk.css";
import apiService from "../../api/apiService";
import adminService from "../../api/adminService";
import { useSelector } from "react-redux";

const AttendanceKiosk = () => {
  // Get params from all possible route patterns
  const { classId, sessionId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Component state
  const [status, setStatus] = useState("ready"); // ready, scanning, processing, success, error
  const [message, setMessage] = useState("Waiting to scan...");
  const [sessionInfo, setSessionInfo] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Selection state
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(classId || "");
  const [selectedSessionId, setSelectedSessionId] = useState(sessionId || "");
  const [loading, setLoading] = useState(false);

  // Camera refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Determine if user is a teacher or admin (can select sessions)
  const isAdminOrTeacher = user?.role === "admin" || user?.role === "teacher";

  // Load initial data
  useEffect(() => {
    // Clear any error messages when component mounts
    setErrorMessage("");

    // Initial class/session state based on URL
    if (classId) {
      setSelectedClassId(classId);
      fetchSessionsForClass(classId);
    } else {
      // No class in URL, fetch available classes for selection
      fetchClasses();
    }

    // If session ID is provided, fetch that specific session
    if (sessionId) {
      setSelectedSessionId(sessionId);
      fetchSessionInfo(sessionId);
    }

    // Start camera
    startCamera();

    // Clean up on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [classId, sessionId]);

  // Fetch available classes
  const fetchClasses = async () => {
    try {
      setLoading(true);
      let classesData;

      // For admin, get all classes
      if (user?.role === "admin") {
        classesData = await adminService.getClasses();
      }
      // For teachers, get their classes
      else if (user?.role === "teacher") {
        classesData = await apiService.get("/users/me/classes");
        classesData = classesData.data;
      }

      setClasses(classesData || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setErrorMessage("Could not load classes.");
      setLoading(false);
    }
  };

  // Fetch sessions for a selected class
  const fetchSessionsForClass = async (classId) => {
    if (!classId) return;

    try {
      setLoading(true);
      const sessionsData = await adminService.getClassSessions(classId);

      // Filter to only show today's and future sessions
      const now = new Date();
      const todaySessions = sessionsData.filter((session) => {
        const sessionDate = new Date(session.session_date);
        return sessionDate.toDateString() === now.toDateString();
      });

      setSessions(todaySessions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setErrorMessage("Could not load sessions for this class.");
      setLoading(false);
    }
  };

  // Fetch session info
  const fetchSessionInfo = async (sessionId) => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await apiService.get(`/classes/sessions/${sessionId}`);
      setSessionInfo(response.data);
      setLoading(false);

      // Start camera if not already started
      if (!streamRef.current) {
        startCamera();
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      setErrorMessage(
        "Could not load session information. Please check the session ID.",
      );
      setStatus("error");
      setLoading(false);
    }
  };

  // Handle class selection
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setSelectedSessionId("");
    setSessions([]);

    if (classId) {
      // Update URL to reflect class selection
      navigate(`/kiosk/class/${classId}`, { replace: true });
      fetchSessionsForClass(classId);
    } else {
      // Reset to base kiosk URL if no class selected
      navigate("/kiosk", { replace: true });
    }
  };

  // Handle session selection
  const handleSessionChange = (e) => {
    const sessionId = e.target.value;
    setSelectedSessionId(sessionId);

    if (sessionId) {
      // Update URL to include both class and session IDs
      navigate(`/kiosk/class/${selectedClassId}/session/${sessionId}`, {
        replace: true,
      });
      fetchSessionInfo(sessionId);
    } else {
      // Go back to just class selection if no session selected
      navigate(`/kiosk/class/${selectedClassId}`, { replace: true });
      setSessionInfo(null);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      if (streamRef.current) return; // Camera already started

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStatus("scanning");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMessage("Could not access camera. Please check permissions.");
      setStatus("error");
    }
  };

  // Capture image
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Return a promise that resolves with the blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.85,
      );
    });
  };

  // Handle check-in
  const checkIn = async () => {
    if (!selectedSessionId) {
      setErrorMessage("Please select a session first");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Processing...");

      // Capture image
      const imageBlob = await captureImage();
      if (!imageBlob) {
        throw new Error("Failed to capture image");
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", imageBlob, "attendance.jpg");

      // Send to API
      const response = await apiService.post(
        `/attendance/check-in?session_id=${selectedSessionId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Update status and message
      setStatus("success");
      setMessage(
        `Success! ${
          response.data.status === "LATE"
            ? "Student is late."
            : "Student is on time."
        }`,
      );

      // Add to recent check-ins
      const checkin = {
        id: Date.now(),
        name: response.data.user_name || "Student",
        time: new Date().toLocaleTimeString(),
        status: response.data.status,
        lateMinutes: response.data.late_minutes || 0,
      };

      setRecentCheckins((prev) => [checkin, ...prev.slice(0, 4)]);

      // Reset after 3 seconds
      setTimeout(() => {
        setStatus("scanning");
        setMessage("Waiting to scan...");
      }, 3000);
    } catch (error) {
      console.error("Check-in error:", error);
      setStatus("error");
      setMessage(error.response?.data?.detail || "Failed to check in");

      // Reset after 3 seconds
      setTimeout(() => {
        setStatus("scanning");
        setMessage("Waiting to scan...");
      }, 3000);
    }
  };

  // Format time helper
  const formatTime = (dateTime) => {
    if (!dateTime) return "";
    try {
      const date = new Date(dateTime);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateTime;
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString([], {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="kiosk-container">
      <header className="kiosk-header">
        <h1>Attendance Check-In Kiosk</h1>
        {sessionInfo ? (
          <div className="session-info">
            <h2>{sessionInfo.class_name || "Class Session"}</h2>
            <p>{formatDate(sessionInfo.session_date)}</p>
            <p>
              {formatTime(sessionInfo.start_time)} -{" "}
              {formatTime(sessionInfo.end_time)}
            </p>
          </div>
        ) : (
          <div className="session-info">
            <h2>No Session Selected</h2>
            <p>Please select a class and session below</p>
          </div>
        )}
      </header>

      <main className="kiosk-main">
        {/* Always show session selector if no session is selected */}
        {!sessionInfo && (
          <div className="session-selector">
            <div className="select-container">
              <label htmlFor="class-select">Select Class:</label>
              <select
                id="class-select"
                value={selectedClassId}
                onChange={handleClassChange}
                disabled={loading}
              >
                <option value="">-- Select a class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.class_code})
                  </option>
                ))}
              </select>
            </div>

            {selectedClassId && (
              <div className="select-container">
                <label htmlFor="session-select">Select Session:</label>
                <select
                  id="session-select"
                  value={selectedSessionId}
                  onChange={handleSessionChange}
                  disabled={loading || sessions.length === 0}
                >
                  <option value="">-- Select a session --</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {formatTime(session.start_time)} -{" "}
                      {formatTime(session.end_time)}
                    </option>
                  ))}
                </select>
                {sessions.length === 0 && selectedClassId && (
                  <p className="info-message">
                    No sessions available for today
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="camera-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`camera-view ${status}`}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className={`status-indicator ${status}`}>
            <div className="status-message">{message}</div>
          </div>
        </div>

        <div className="controls">
          <button
            className="capture-button"
            onClick={checkIn}
            disabled={status === "processing" || !sessionInfo}
          >
            {sessionInfo ? "Check In Student" : "Select a Session First"}
          </button>
        </div>

        {sessionInfo && (
          <button
            className="secondary-button"
            onClick={() => {
              setSessionInfo(null);
              navigate(`/kiosk/class/${selectedClassId}`, { replace: true });
            }}
            style={{ marginTop: "16px" }}
          >
            Back to Session Selection
          </button>
        )}

        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </main>

      <aside className="recent-checkins">
        <h3>Recent Check-ins</h3>
        {recentCheckins.length > 0 ? (
          <ul className="checkin-list">
            {recentCheckins.map((checkin) => (
              <li
                key={checkin.id}
                className={`checkin-item ${checkin.status.toLowerCase()}`}
              >
                <span className="checkin-name">{checkin.name}</span>
                <span className="checkin-time">{checkin.time}</span>
                <span className="checkin-status">
                  {checkin.status === "LATE"
                    ? `Late (${checkin.lateMinutes} min)`
                    : "Present"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-checkins">No recent check-ins</p>
        )}
      </aside>
    </div>
  );
};

export default AttendanceKiosk;
