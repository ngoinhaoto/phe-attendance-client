import { useState, useEffect, useRef } from "react";
import apiService from "../../../api/apiService";

export default function useFaceRegistration(user) {
  const [registeredFaces, setRegisteredFaces] = useState([]);
  const [faceRegDialogOpen, setFaceRegDialogOpen] = useState(false);
  const [faceRegLoading, setFaceRegLoading] = useState(false);
  const [faceRegError, setFaceRegError] = useState("");
  const [faceRegSuccess, setFaceRegSuccess] = useState(null);
  const [stream, setStream] = useState(null);
  const [selectedFace, setSelectedFace] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchRegisteredFaces();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [user]);

  const fetchRegisteredFaces = async () => {
    try {
      const response = await apiService.get("/attendance/my-faces");
      if (response.data && response.data.faces) {
        // Group by registration_group_id if it exists
        const uniqueFaces = [];
        const groupMap = new Map();

        response.data.faces.forEach((face) => {
          // If the face has no group ID or we haven't seen this group yet
          if (
            !face.registration_group_id ||
            !groupMap.has(face.registration_group_id)
          ) {
            if (face.registration_group_id) {
              groupMap.set(face.registration_group_id, face);
            }
            uniqueFaces.push(face);
          } else if (
            face.image &&
            !groupMap.get(face.registration_group_id).image
          ) {
            // If this face in the same group has an image but the saved one doesn't,
            // replace it with this one
            const index = uniqueFaces.findIndex(
              (f) => f.registration_group_id === face.registration_group_id,
            );
            if (index !== -1) {
              uniqueFaces[index] = face;
              groupMap.set(face.registration_group_id, face);
            }
          }
        });

        setRegisteredFaces(uniqueFaces);
      } else {
        setRegisteredFaces([]);
      }
    } catch (error) {
      console.error("Error fetching registered faces:", error);
    }
  };

  const openFaceRegistrationDialog = () => {
    setFaceRegDialogOpen(true);
    setFaceRegError("");
    setFaceRegSuccess(null);
    startCamera();
  };

  const closeFaceRegistrationDialog = () => {
    setFaceRegDialogOpen(false);
    stopCamera();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setFaceRegError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.9,
      );
    });
  };

  const registerFace = async () => {
    try {
      setFaceRegLoading(true);
      setFaceRegError("");
      setFaceRegSuccess(null);

      const imageBlob = await captureImage();
      if (!imageBlob) {
        setFaceRegError("Failed to capture image");
        return;
      }

      const formData = new FormData();
      formData.append("file", imageBlob, "register-face.jpg");
      formData.append("device_id", "web");

      const response = await apiService.post(
        "/attendance/register-face",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setFaceRegSuccess({
        message: "Face registered successfully!",
        confidence: response.data.confidence,
        count: response.data.embeddings_count,
        alignedFace: response.data.aligned_face,
      });

      await fetchRegisteredFaces();
    } catch (error) {
      console.error("Error registering face:", error);
      setFaceRegError(
        error.response?.data?.detail || "Failed to register face",
      );
    } finally {
      setFaceRegLoading(false);
    }
  };

  const deleteFace = async (faceId) => {
    try {
      await apiService.delete(`/attendance/my-faces/${faceId}`);
      await fetchRegisteredFaces();
      if (detailsOpen) setDetailsOpen(false);
    } catch (error) {
      console.error("Error deleting face:", error);
    }
  };

  const openFaceDetails = (face) => {
    setSelectedFace(face);
    setDetailsOpen(true);
  };

  const resetRegistration = () => {
    // Clear success message and error to start fresh
    setFaceRegSuccess(null);
    setFaceRegError("");

    // Make sure camera is still running
    if (!stream || !stream.active) {
      startCamera();
    }
  };

  return {
    registeredFaces,
    faceRegDialogOpen,
    faceRegLoading,
    faceRegError,
    faceRegSuccess,
    selectedFace,
    detailsOpen,
    videoRef,
    canvasRef,
    openFaceRegistrationDialog,
    closeFaceRegistrationDialog,
    registerFace,
    deleteFace,
    openFaceDetails,
    setDetailsOpen,
    resetRegistration,
  };
}
