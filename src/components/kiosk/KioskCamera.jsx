import React, { useState } from "react";
import {
  CircularProgress,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { set } from "date-fns";

const KioskCamera = ({
  loadingSession,
  status,
  setStatus, // <-- add this
  message,
  videoRef,
  canvasRef,
  streamRef,
  startCamera,
}) => {
  const [cameraRetries, setCameraRetries] = useState(0);
  const [showGuide, setShowGuide] = useState(true);

  const handleRetryCamera = () => {
    setCameraRetries((prev) => prev + 1);
    setStatus("loading");

    startCamera();
  };

  return (
    <div className="camera-container">
      {loadingSession ? (
        <div className="camera-loading">
          <CircularProgress size={40} />
          <p>Loading session...</p>
        </div>
      ) : (
        <>
          {/* Face positioning guide toggle */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <div className="camera-controls-row">
              <FormControlLabel
                control={
                  <Switch
                    checked={showGuide}
                    onChange={() => setShowGuide(!showGuide)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">
                    Show face positioning guide
                  </Typography>
                }
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                  },
                }}
              />

              {/* Simple button version */}
              <button
                className="reload-camera-button"
                onClick={handleRetryCamera}
              >
                <span>↻</span> Reload Camera
              </button>
            </div>
          </Box>

          <div className={`camera-wrapper ${status}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`camera-view ${status}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Face positioning guide overlay */}
            {showGuide && status === "scanning" && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                {/* Oval face guide */}
                <Box
                  sx={{
                    width: "60%",
                    height: "80%",
                    border: "3px dashed rgba(255, 255, 255, 0.6)",
                    borderRadius: "50%",
                    boxSizing: "border-box",
                    position: "relative",
                  }}
                />

                {/* Center cross marker */}
                <Box
                  sx={{
                    position: "absolute",
                    width: "10px",
                    height: "10px",
                    backgroundColor: "transparent",
                    "&::before, &::after": {
                      content: '""',
                      position: "absolute",
                      backgroundColor: "rgba(255, 255, 255, 0.6)",
                    },
                    "&::before": {
                      width: "10px",
                      height: "2px",
                      top: "4px",
                      left: "0",
                    },
                    "&::after": {
                      width: "2px",
                      height: "10px",
                      top: "0",
                      left: "4px",
                    },
                  }}
                />

                {/* Guidelines text */}
                <div className="camera-guide-text">
                  Position your face within the oval for check-in
                </div>
              </Box>
            )}

            {(status === "error" ||
              (streamRef.current === null && status === "scanning")) && (
              <div className="camera-error-overlay">
                <div style={{ textAlign: "center", color: "white" }}>
                  <p style={{ marginBottom: "16px" }}>
                    {status === "error"
                      ? "Error occurred"
                      : "Camera not active or showing black screen"}
                  </p>
                  <button onClick={handleRetryCamera} className="retry-button">
                    Retry Camera {cameraRetries > 0 ? `(${cameraRetries})` : ""}
                  </button>
                </div>
              </div>
            )}

            {/* Status feedback overlay */}
            {status === "processing" && (
              <div className="camera-processing-overlay">
                <CircularProgress size={40} style={{ color: "white" }} />
                <p style={{ color: "white", marginTop: "8px" }}>
                  Processing...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="camera-success-overlay">
                <div style={{ textAlign: "center" }}>
                  <div className="success-icon">✓</div>
                  <p>Check-in successful!</p>
                </div>
              </div>
            )}

            {/* Loading indicator for camera initialization */}
            {status === "loading" && (
              <div className="camera-loading-indicator">
                <CircularProgress size={40} />
                <p>Initializing camera...</p>
              </div>
            )}
          </div>

          <div className={`status-indicator ${status}`}>
            <div className="status-message">{message}</div>
            {status === "scanning" && streamRef.current === null && (
              <div className="camera-status">
                Camera not active - click Retry
              </div>
            )}
          </div>

          {/* Face positioning instructions */}
          {status === "scanning" && (
            <Box
              sx={{
                width: "100%",
                maxWidth: "620px",
                mt: 1,
                p: 2,
                bgcolor: "rgba(25, 118, 210, 0.1)",
                borderRadius: 1,
                border: "1px solid rgba(25, 118, 210, 0.2)",
              }}
            >
              <Typography
                variant="body2"
                component="div"
                sx={{ fontWeight: "medium", mb: 1 }}
              >
                For successful check-in:
              </Typography>
              <Typography variant="caption" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Look directly at the camera</li>
                <li>Ensure good lighting on your face</li>
                <li>Center your face inside the oval guide</li>
                <li>Keep your entire face visible</li>
                <li>Remove masks, sunglasses, or face coverings</li>
              </Typography>
            </Box>
          )}
        </>
      )}
    </div>
  );
};

export default KioskCamera;
