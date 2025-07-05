import apiService from "./apiService";
import pheMicroserviceClient from "./pheMicroserviceClient";

const pheService = {
  // Cache the PHE status to avoid too many requests
  _pheStatus: null,
  _lastCheckTime: 0,

  // Check if PHE is enabled and available
  isPHEEnabled: async () => {
    try {
      // Only check once per minute unless forced
      const now = Date.now();
      if (
        pheService._pheStatus !== null &&
        now - pheService._lastCheckTime < 60000
      ) {
        return pheService._pheStatus;
      }

      console.log("Checking PHE microservice availability...");
      // Try direct communication with microservice
      const response = await pheMicroserviceClient.get("/");
      console.log("PHE microservice is available:", response.data);

      pheService._pheStatus = true;
      pheService._lastCheckTime = now;
      return true;
    } catch (microError) {
      console.error("Cannot connect to PHE microservice:", microError.message);
      pheService._pheStatus = false;
      pheService._lastCheckTime = Date.now();
      return false;
    }
  },

  // Register a face with PHE - Direct Flow
  registerFace: async (imageBlob) => {
    try {
      console.log(
        "Registering face with PHE direct flow, blob size:",
        imageBlob.size,
      );

      // Add validation for the blob
      if (!imageBlob || imageBlob.size < 1000) {
        throw new Error(
          "Image too small or invalid. Please try again with a clearer photo.",
        );
      }

      const formData = new FormData();
      formData.append("file", imageBlob, "face.jpg");

      // Log headers being sent for debugging
      console.log(
        "Sending request to PHE microservice with content type:",
        formData.get("file").type,
      );

      const response = await pheMicroserviceClient.post(
        "/register-face-direct",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 60000,
        },
      );

      console.log("PHE direct registration response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in PHE face registration:", error);

      if (error.response) {
        const statusCode = error.response.status;
        const errorDetail = error.response.data?.detail || "Unknown error";

        if (statusCode === 400) {
          // Handle 400 Bad Request errors (validation errors)
          if (
            errorDetail.includes("No face detected") ||
            errorDetail.includes("Face could not be detected")
          ) {
            throw new Error(
              "No face detected in the image. Please ensure your face is clearly visible and try again.",
            );
          } else if (errorDetail.includes("Incomplete face")) {
            throw new Error(
              "Your entire face must be visible in the frame. Please adjust your position and try again.",
            );
          } else if (errorDetail.includes("spoofing")) {
            throw new Error(
              "Our system detected a potential security issue. Please use a live face for registration.",
            );
          }
          // Pass through the detailed error message for other 400 errors
          throw new Error(errorDetail);
        } else if (statusCode === 500) {
          // Handle 500 Internal Server errors
          console.error(
            "PHE microservice internal error:",
            error.response?.data,
          );
          throw new Error(
            "The face processing service encountered an error. Please try again later.",
          );
        }
      }

      // For network errors or other unhandled errors
      throw new Error(
        "Connection error. Please check your internet connection and try again.",
      );
    }
  },

  // Add this new method for face verification
  verifyFace: async (imageBlob, sessionId) => {
    try {
      console.log("Verifying face with PHE, session ID:", sessionId);

      // Create form data with the image
      const formData = new FormData();
      formData.append("file", imageBlob, "verify.jpg");

      // Use direct approach
      const response = await pheMicroserviceClient.post(
        "/verify-face-direct",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            session_id: sessionId,
          },
          timeout: 60000,
        },
      );

      console.log("PHE verification response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in PHE face verification:", error);
      throw error;
    }
  },

  // Add new method to pheService.js
  registerFaceServerSide: async (imageBlob) => {
    try {
      console.log(
        "Registering face with server-side encryption, blob size:",
        imageBlob.size,
      );

      if (!imageBlob || imageBlob.size < 1000) {
        throw new Error(
          "Image too small or invalid. Please try again with a clearer photo.",
        );
      }

      const formData = new FormData();
      formData.append("file", imageBlob, "face.jpg");

      const response = await pheMicroserviceClient.post(
        "/register-face-server-encryption",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 60000,
        },
      );

      console.log(
        "Server-side encryption registration response:",
        response.data,
      );
      return response.data;
    } catch (error) {
      console.error("Error in server-side face registration:", error);

      if (error.response) {
        // Server responded with an error
        const statusCode = error.response.status;
        const errorDetail = error.response.data?.detail || "Unknown error";

        if (statusCode === 400) {
          // Handle 400 Bad Request errors (validation errors)
          if (
            errorDetail.includes("No face detected") ||
            errorDetail.includes("Face could not be detected")
          ) {
            throw new Error(
              "No face detected in the image. Please ensure your face is clearly visible and try again.",
            );
          } else if (errorDetail.includes("Incomplete face")) {
            throw new Error(
              "Your entire face must be visible in the frame. Please adjust your position and try again.",
            );
          } else if (errorDetail.includes("spoofing")) {
            throw new Error(
              "Our system detected a potential security issue. Please use a live face for registration.",
            );
          }
          // Pass through the detailed error message for other 400 errors
          throw new Error(errorDetail);
        } else if (statusCode === 500) {
          // Handle 500 Internal Server errors
          console.error(
            "PHE microservice internal error:",
            error.response?.data,
          );
          throw new Error(
            "The face processing service encountered an error. Please try again later.",
          );
        }
      }

      // For network errors or other unhandled errors
      throw new Error(
        "Connection error. Please check your internet connection and try again.",
      );
    }
  },
};

export default pheService;
