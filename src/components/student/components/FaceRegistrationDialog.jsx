import React from "react";
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
} from "@mui/material";
import { AddAPhoto as AddPhotoIcon } from "@mui/icons-material";

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

        <Typography variant="body2" paragraph>
          Please look directly at the camera in good lighting. For best results,
          register multiple angles of your face.
        </Typography>

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
          <Button onClick={onRegister} variant="contained" disabled={loading}>
            {loading ? "Processing..." : "Register Face"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FaceRegistrationDialog;
