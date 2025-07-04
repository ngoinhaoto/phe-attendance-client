import { useState, useEffect, useRef } from "react";
import apiService from "../../../api/apiService";
import pheService from "../../../api/pheService"; // Import the PHE service

export default function useFaceRegistration(user) {
  const [registeredFaces, setRegisteredFaces] = useState([]);
  const [faceRegDialogOpen, setFaceRegDialogOpen] = useState(false);
  const [faceRegLoading, setFaceRegLoading] = useState(false);
  const [faceRegError, setFaceRegError] = useState("");
  const [faceRegSuccess, setFaceRegSuccess] = useState("");
  const [isPHEEnabled, setIsPHEEnabled] = useState(false);
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

  // Function to register a face
  const registerFace = async (imageBlob) => {
    setFaceRegLoading(true);
    setFaceRegError("");
    setFaceRegSuccess("");
    try {
      console.log("registerFace called with imageBlob:", imageBlob);
      if (!imageBlob) {
        throw new Error("No image captured. Please try again.");
      }

      if (imageBlob.size < 5000) {
        throw new Error(
          "Captured image is too small. Please ensure good lighting and try again.",
        );
      }

      console.log("Image blob size:", imageBlob.size, "bytes");

      // Check if PHE is enabled (with caching)
      const pheEnabled = await pheService.isPHEEnabled();
      console.log("PHE enabled:", pheEnabled);

      let response;
      if (pheEnabled) {
        // Try PHE registration
        try {
          response = await pheService.registerFace(imageBlob);
          console.log("PHE microservice registerFace response:", response);

          // Format the success data from PHE registration to match expected format
          const successData = {
            message: response.message || "Face registered successfully with PHE",
            embeddings_count: 1, // Since we don't get this info from PHE service
            confidence: 1.0, // PHE doesn't provide confidence score
            face_id: response.embedding_id,
            registration_group_id: response.registration_group_id,
            // No aligned face available with PHE
            phe_protected: true, // Add this flag to indicate PHE protection
          };

          setFaceRegSuccess(successData);
          fetchRegisteredFaces();
          return successData;
        } catch (pheError) {
          console.error("PHE registration failed:", pheError);
          setFaceRegError(
            pheError.message ||
              "PHE registration failed. Trying standard registration...",
          );

          // Fall back to standard registration
          const formData = new FormData();
          formData.append("file", imageBlob, "face.jpg");
          response = await apiService.post(
            "/attendance/register-face",
            formData,
          );
        }
      } else {
        // Use standard registration
        const formData = new FormData();
        formData.append("file", imageBlob, "face.jpg");
        response = await apiService.post("/attendance/register-face", formData);
        console.log("Standard registerFace response:", response);
      }

      setFaceRegSuccess(response.data);
      fetchRegisteredFaces();
      return response.data;
    } catch (error) {
      console.error("Face registration error:", error);
      setFaceRegError(
        error.message ||
          error.response?.data?.detail ||
          "Failed to register face. Please try again.",
      );
      return null;
    } finally {
      setFaceRegLoading(false);
    }
  };

  // Check if PHE is enabled when component mounts
  useEffect(() => {
    const checkPHEStatus = async () => {
      try {
        console.log("Checking PHE status from useFaceRegistration...");
        const pheEnabled = await pheService.isPHEEnabled();
        console.log("PHE enabled status:", pheEnabled);
        setIsPHEEnabled(pheEnabled);
      } catch (error) {
        console.error("Error checking PHE status:", error);
        setIsPHEEnabled(false);
      }
    };

    checkPHEStatus();
  }, []);

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
    isPHEEnabled,
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
    captureImage,
    setFaceRegLoading,  // Make sure this is included!
    setFaceRegSuccess,  // Make sure this is included!
    fetchRegisteredFaces  // Make sure this is included!
  };
}
