import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  AddAPhoto as AddPhotoIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

const FaceRegistrationDialog = ({
  open,
  onClose,
  error,
  success,
  loading,
  videoRef,
  canvasRef,
  onRegister,
  onReset,
}) => {
  const [showGuide, setShowGuide] = useState(true);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Register Your Face</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success.message}
            <br />
            Confidence: {(success.confidence * 100).toFixed(1)}%
            <br />
            You now have {Math.ceil(success.count / 2)} registered face images.
            {success.alignedFace && (
              <Box sx={{ mt: 1, textAlign: "center" }}>
                <img
                  src={`data:image/jpeg;base64,${success.alignedFace}`}
                  alt="Registered face"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "150px",
                    borderRadius: "4px",
                  }}
                />
              </Box>
            )}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight="medium" gutterBottom>
            Face Registration Guidelines:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Look directly at the camera in good lighting</li>
            <li>Position your face within the oval guide</li>
            <li>Ensure your entire face is visible (eyes, nose, mouth)</li>
            <li>Remove glasses, masks, or anything covering your face</li>
            <li>For best results, register multiple angles of your face</li>
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={showGuide}
              onChange={() => setShowGuide(!showGuide)}
              color="primary"
            />
          }
          label="Show positioning guide"
          sx={{ mb: 1 }}
        />

        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 0,
            paddingBottom: "75%",
            overflow: "hidden",
            borderRadius: 1,
            bgcolor: "black",
            mb: 2,
          }}
        >
          {/* Video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
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

          {/* Face positioning guide */}
          {showGuide && (
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
                Position your face within the oval
              </div>
            </Box>
          )}

          {loading && (
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
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
        <Button onClick={onClose}>Close</Button>

        {success ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddPhotoIcon />}
            onClick={onReset}
          >
            Register Another
          </Button>
        ) : (
          <Button
            onClick={onRegister}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? undefined : <CheckIcon />}
          >
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {loading ? "Processing..." : "Register Face"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FaceRegistrationDialog;
