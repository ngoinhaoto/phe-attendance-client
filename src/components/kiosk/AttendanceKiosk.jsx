import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./AttendanceKiosk.css";
import apiService from "../../api/apiService";
import adminService from "../../api/adminService";
import { useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import KioskExitDialog from "./KioskExitDialog";
import KioskHeader from "./KioskHeader";
import KioskCamera from "./KioskCamera";
import KioskControls from "./KioskControls";
import SessionSelector from "./SessionSelector";
import useKioskAPI from "./hooks/useKioskAPI";
import useKioskMode from "./hooks/useKioskMode";
import useCameraFunctions from "./hooks/useCameraFunctions";
import useEventHandlers from "./hooks/useEventHandlers";
import RecentCheckins from "./RecentCheckins";
import FullAttendanceTable from "./FullAttendanceTable";
import ClassAttendanceSummary from "../admin/classes/ClassAttendanceSummary";

// Import the utility functions
import { formatDate, formatTime, isSessionValid } from "../../utils/dateUtils";

const AttendanceKiosk = () => {
  // Get route parameters and navigation
  const { classId, sessionId } = useParams();
  const auth = useSelector((state) => state.auth);
  const user = auth?.isAuthenticated ? auth.user : null;
  const navigate = useNavigate();
  const location = useLocation();

  // Camera state
  const [status, setStatus] = useState("ready"); // ready, scanning, processing, success, error
  const [message, setMessage] = useState("Waiting to scan...");

  // Session state
  const [sessionInfo, setSessionInfo] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [fullAttendance, setFullAttendance] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Selection state
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");

  // Loading states
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);

  // Camera refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Kiosk mode state
  const [kioskMode, setKioskMode] = useState(false);

  // Blocked navigation alert state
  const [showBlockedNavAlert, setShowBlockedNavAlert] = useState(false);

  // Toggle state for full attendance view
  const [showFullAttendance, setShowFullAttendance] = useState(false);

  // ---- Extracted API functions ----
  const { fetchClasses, fetchSessionsForClass, fetchSessionInfo } = useKioskAPI(
    {
      setLoadingClasses,
      setClasses,
      setErrorMessage,
      setLoadingSessions,
      setSessions,
      setLoadingSession,
      setSessionInfo,
      navigate,
      setStatus,
      setRecentCheckins,
      setFullAttendance, // Add this
    },
  );

  const { startCamera, stopCamera, captureImage, checkIn } = useCameraFunctions(
    {
      videoRef,
      canvasRef,
      streamRef,
      setStatus,
      setMessage,
      setErrorMessage,
      selectedSessionId,
      apiService,
      setRecentCheckins,
      sessionInfo,
    },
  );

  // ---- Extracted Kiosk Mode functions ----
  const { enableKioskMode, disableKioskMode } = useKioskMode({
    setKioskMode,
    user,
  });

  // ---- Extracted Event Handlers ----
  const {
    handleClassChange,
    handleSessionChange,
    handleBackToSessionSelection,
  } = useEventHandlers({
    setSelectedClassId,
    setSelectedSessionId,
    setSessions,
    setSessionInfo,
    navigate,
    selectedClassId,
  });

  // ---- Use Effects ----
  // Initial setup - sync URL params with state and fetch data
  useEffect(() => {
    // Reset errors when component mounts
    setErrorMessage("");

    const initializeFromURL = async () => {
      let currentClassId = classId;
      let currentSessionId = sessionId;

      // Step 1: Initialize with class from URL (if provided)
      if (currentClassId) {
        setSelectedClassId(currentClassId);
        await fetchSessionsForClass(currentClassId);

        // Step 2: Initialize with session from URL (if provided)
        if (currentSessionId) {
          setSelectedSessionId(currentSessionId);
          await fetchSessionInfo(currentSessionId);
        }
      } else {
        // No URL params, just fetch available classes
        await fetchClasses();
      }

      // Start camera after all data is loaded
      await startCamera();
    };

    initializeFromURL();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Check if kiosk mode was previously enabled
  useEffect(() => {
    if (sessionStorage.getItem("kioskMode") === "true") {
      setKioskMode(true);
    }
  }, []);

  // Prevent navigation away from kiosk in kiosk mode
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (kioskMode) {
        e.preventDefault();
        e.returnValue = "";
        // Show alert
        setShowBlockedNavAlert(true);
      }
    };

    const handleNavigation = () => {
      if (kioskMode) {
        setShowBlockedNavAlert(true);
        // Delay to allow the alert to show before redirecting
        setTimeout(() => {
          navigate("/kiosk", { replace: true });
        }, 100);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, [kioskMode, navigate]);

  // Monitor route changes to update state
  useEffect(() => {
    // Only update state if URL params change
    if (classId !== selectedClassId) {
      setSelectedClassId(classId || "");
      if (classId) {
        fetchSessionsForClass(classId);
      }
    }

    if (sessionId !== selectedSessionId) {
      setSelectedSessionId(sessionId || "");
      if (sessionId) {
        fetchSessionInfo(sessionId);
      } else {
        setSessionInfo(null);
      }
    }
  }, [classId, sessionId, location]);

  // Add black screen detection
  useEffect(() => {
    if (!videoRef.current || status !== "scanning") return;

    let checkInterval;
    let blackFrameCount = 0;

    const checkVideoStream = () => {
      try {
        // Don't check if video isn't playing
        if (
          !videoRef.current ||
          videoRef.current.paused ||
          videoRef.current.ended
        ) {
          return;
        }

        // Check if we can capture a frame
        const tempCanvas = document.createElement("canvas");
        const context = tempCanvas.getContext("2d");
        tempCanvas.width = videoRef.current.videoWidth || 640;
        tempCanvas.height = videoRef.current.videoHeight || 480;

        // Try to draw current video frame
        context.drawImage(
          videoRef.current,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
        );

        // Check if the frame has any content (not just black)
        const imageData = context.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
        ).data;
        let hasContent = false;

        // Sample pixels throughout the image
        for (let i = 0; i < imageData.length; i += 5000) {
          // Check if any RGB values are significantly above black
          if (
            imageData[i] > 20 ||
            imageData[i + 1] > 20 ||
            imageData[i + 2] > 20
          ) {
            hasContent = true;
            break;
          }
        }

        if (!hasContent) {
          blackFrameCount++;
          console.log(`Black frame detected (${blackFrameCount}/3)`);

          // If we see 3 consecutive black frames, restart the camera
          if (blackFrameCount >= 3) {
            console.log("Multiple black frames detected - restarting camera");
            blackFrameCount = 0;
            startCamera();
          }
        } else {
          // Reset counter if we detect content
          blackFrameCount = 0;
        }
      } catch (e) {
        console.warn("Error checking video stream:", e);
      }
    };

    // Check for black frames every 2 seconds
    checkInterval = setInterval(checkVideoStream, 2000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [videoRef, status, startCamera]);

  return (
    <div className="kiosk-container">
      <KioskHeader
        kioskMode={kioskMode}
        enableKioskMode={enableKioskMode}
        disableKioskMode={disableKioskMode}
        navigate={navigate}
        sessionInfo={sessionInfo}
        formatDate={formatDate}
        formatTime={formatTime}
        user={user}
        showBlockedNavAlert={showBlockedNavAlert}
        setShowBlockedNavAlert={setShowBlockedNavAlert}
        selectedClassId={selectedClassId}
        classes={classes}
      />

      <main className="kiosk-main">
        {/* Error Message */}
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
            <button className="close-error" onClick={() => setErrorMessage("")}>
              ✕
            </button>
          </div>
        )}

        {/* Class and Session Selectors */}
        {!sessionInfo && (
          <div className="session-selector-container">
            <SessionSelector
              loadingClasses={loadingClasses}
              loadingSessions={loadingSessions}
              classes={classes}
              sessions={sessions}
              selectedClassId={selectedClassId}
              selectedSessionId={selectedSessionId}
              handleClassChange={handleClassChange}
              handleSessionChange={handleSessionChange}
              formatTime={formatTime}
            />
          </div>
        )}

        {/* Side-by-side layout container */}
        <div className="checkin-layout">
          {/* Left column: Camera and Controls */}
          <div className="camera-column">
            <KioskCamera
              loadingSession={loadingSession}
              status={status}
              message={message}
              videoRef={videoRef}
              canvasRef={canvasRef}
              streamRef={streamRef}
              startCamera={startCamera}
            />

            <KioskControls
              status={status}
              sessionInfo={sessionInfo}
              loadingSession={loadingSession}
              checkIn={checkIn}
              handleBackToSessionSelection={handleBackToSessionSelection}
            />
          </div>

          {/* Right column: Attendance Information */}
          <div className="checkins-column">
            {/* Only show attendance info when we have session info */}
            {sessionInfo && (
              <>
                {/* Attendance Summary */}
                <ClassAttendanceSummary attendance={fullAttendance} />

                {/* Toggle Button */}
                <div className="view-toggle">
                  <button
                    className={`view-toggle-button ${
                      showFullAttendance ? "expanded" : "collapsed"
                    }`}
                    onClick={() => setShowFullAttendance(!showFullAttendance)}
                  >
                    {showFullAttendance
                      ? "Hide Full Attendance"
                      : "View Full Attendance"}
                  </button>
                </div>

                {/* Conditional display based on toggle */}
                {showFullAttendance ? (
                  <FullAttendanceTable attendance={fullAttendance} />
                ) : (
                  <RecentCheckins recentCheckins={recentCheckins} />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendanceKiosk;
