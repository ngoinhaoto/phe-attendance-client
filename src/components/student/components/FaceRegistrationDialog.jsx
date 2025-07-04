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
  Chip,
} from "@mui/material";
import {
  AddAPhoto as AddPhotoIcon,
  Check as CheckIcon,
  Lock as LockIcon,
  Storage as StorageIcon, // Add this import
} from "@mui/icons-material";
import pheService from "../../../api/pheService"; // Add this import

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
  captureImage,
  setFaceRegLoading, // Add these props
  setFaceRegSuccess,
  fetchRegisteredFaces,
}) => {
  const [showGuide, setShowGuide] = useState(true);

  // Function to handle errors by passing them back to the parent
  const handleError = (errorMessage) => {
    // If error comes from the parent component via props, use its structure
    if (
      typeof error === "object" &&
      error !== null &&
      typeof error.setFaceRegError === "function"
    ) {
      error.setFaceRegError(errorMessage);
    } else {
      console.error("Error handler not available:", errorMessage);
    }
  };

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
            {success.phe_protected && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  icon={<LockIcon fontSize="small" />}
                  label="PHE Protected"
                  color="success"
                  size="small"
                />
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Your face data is encrypted with Partially Homomorphic
                  Encryption
                </Typography>
              </Box>
            )}
            {success.embeddings_count && (
              <>
                You now have {Math.ceil(success.embeddings_count / 2)}{" "}
                registered face images.
              </>
            )}
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
          <>
            <Button
              onClick={async () => {
                try {
                  const imageBlob = await captureImage();
                  if (!imageBlob) {
                    throw new Error(
                      "Failed to capture image. Please ensure camera is working.",
                    );
                  }
                  await onRegister(imageBlob);
                } catch (error) {
                  handleError(error.message || "Failed to register face");
                }
              }}
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? undefined : <CheckIcon />}
            >
              {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              {loading ? "Processing..." : "Register Face"}
            </Button>

            {/* Add this button for server-side encryption */}
            <Button
              onClick={async () => {
                try {
                  const imageBlob = await captureImage();
                  if (!imageBlob) {
                    throw new Error(
                      "Failed to capture image. Please ensure camera is working.",
                    );
                  }

                  setFaceRegLoading(true);
                  const response = await pheService.registerFaceServerSide(
                    imageBlob,
                  );

                  // Format the success data
                  const successData = {
                    message:
                      response.message ||
                      "Face registered with server-side encryption",
                    embeddings_count: 1,
                    face_id: response.embedding_id,
                    registration_group_id: response.registration_group_id,
                    phe_protected: true,
                    server_encrypted: true,
                  };

                  setFaceRegSuccess(successData);
                  fetchRegisteredFaces();
                } catch (error) {
                  handleError(
                    error.message || "Failed to register face on server",
                  );
                } finally {
                  setFaceRegLoading(false);
                }
              }}
              variant="outlined"
              color="secondary"
              disabled={loading}
              startIcon={<StorageIcon />}
            >
              Register (Server Encryption)
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FaceRegistrationDialog;
