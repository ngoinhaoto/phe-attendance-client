import React, { useState } from 'react';
import { CircularProgress } from "@mui/material";

const KioskCamera = ({
  loadingSession,
  status,
  message,
  videoRef,
  canvasRef,
  streamRef,
  startCamera
}) => {
  const [cameraRetries, setCameraRetries] = useState(0);

  const handleRetryCamera = () => {
    setCameraRetries(prev => prev + 1);
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

            {(status === "error" || (streamRef.current === null && status === "scanning")) && (
              <div className="camera-error-overlay">
                <div style={{ textAlign: "center", color: "white" }}>
                  <p style={{ marginBottom: "16px" }}>
                    {status === "error" 
                      ? "Camera error occurred" 
                      : "Camera not active or showing black screen"}
                  </p>
                  <button onClick={handleRetryCamera} className="retry-button">
                    Retry Camera {cameraRetries > 0 ? `(${cameraRetries})` : ""}
                  </button>
                </div>
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
        </>
      )}
    </div>
  );
};

export default KioskCamera;