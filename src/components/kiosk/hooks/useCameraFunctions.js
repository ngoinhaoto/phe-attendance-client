import { useCallback } from "react";

export default function useCameraFunctions({
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
}) {
  // Start camera
  const startCamera = useCallback(
    async (retryAttempt = 0) => {
      try {
        // First ensure any previous stream is properly stopped
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Reset the video element
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }

        console.log("Starting camera, attempt:", retryAttempt + 1);

        // Request camera access with specific constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (!stream || !stream.active) {
          throw new Error("Stream obtained but not active");
        }

        // Check if we actually got video tracks
        const videoTracks = stream.getVideoTracks();
        if (!videoTracks || videoTracks.length === 0) {
          throw new Error("No video tracks found in media stream");
        }

        console.log(
          `Got ${videoTracks.length} video tracks, first track:`,
          videoTracks[0].label,
        );

        if (videoRef.current) {
          // Set stream to video element
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          // Create a promise that resolves when the video starts playing
          return new Promise((resolve) => {
            // Set up event handlers for success and failure
            const playSuccess = () => {
              console.log("Camera stream started successfully");
              setStatus("scanning");
              setMessage("Waiting to scan...");

              // Clean up event listeners
              videoRef.current.removeEventListener("playing", playSuccess);
              videoRef.current.removeEventListener("error", playError);

              // Draw a test frame to verify camera is working
              setTimeout(() => {
                try {
                  if (canvasRef.current && videoRef.current) {
                    const ctx = canvasRef.current.getContext("2d");
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    ctx.drawImage(videoRef.current, 0, 0);
                    console.log("Test frame captured successfully");
                  }
                } catch (e) {
                  console.warn("Test frame capture failed:", e);
                }
              }, 500);

              resolve(true);
            };

            const playError = (e) => {
              console.error("Video play error:", e);

              // Clean up event listeners
              videoRef.current.removeEventListener("playing", playSuccess);
              videoRef.current.removeEventListener("error", playError);

              if (retryAttempt < 2) {
                console.log("Retrying camera start...");
                setTimeout(() => {
                  startCamera(retryAttempt + 1)
                    .then(resolve)
                    .catch(() => resolve(false));
                }, 1000);
              } else {
                setErrorMessage(
                  "Could not play video stream after multiple attempts",
                );
                setStatus("error");
                resolve(false);
              }
            };

            // Set up event listeners
            videoRef.current.addEventListener("playing", playSuccess);
            videoRef.current.addEventListener("error", playError);

            // Start playing the video
            videoRef.current.play().catch((e) => {
              console.error("Play failed:", e);
              playError(e);
            });
          });
        } else {
          console.error("Video ref is not available");
          throw new Error("Video element not ready");
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setErrorMessage(
          `Could not access camera: ${err.message || "Permission denied"}. ${
            retryAttempt < 2 ? "Retrying..." : "Please reload the page."
          }`,
        );
        setStatus("error");

        // Retry logic
        if (retryAttempt < 2) {
          console.log("Retrying camera initialization...");
          return new Promise((resolve) => {
            setTimeout(() => {
              startCamera(retryAttempt + 1)
                .then(resolve)
                .catch(() => resolve(false));
            }, 1000);
          });
        }

        return false;
      }
    },
    [videoRef, streamRef, canvasRef, setStatus, setMessage, setErrorMessage],
  );

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [streamRef]);

  // Capture image
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref not available");
      return Promise.reject(new Error("Video not initialized"));
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video is actually playing and has dimensions
    if (video.readyState < 2 || video.paused || !video.videoWidth) {
      console.error("Video not ready for capture", {
        readyState: video.readyState,
        paused: video.paused,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      });
      return Promise.reject(new Error("Video stream not ready for capture"));
    }

    try {
      const context = canvas.getContext("2d");

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear the canvas first
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Verify the canvas has content by checking if any pixels are non-transparent
      try {
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        ).data;
        let hasContent = false;

        // Check if the image has any non-black pixels (checking a subset for performance)
        for (let i = 0; i < imageData.length; i += 400) {
          if (
            imageData[i] > 10 ||
            imageData[i + 1] > 10 ||
            imageData[i + 2] > 10
          ) {
            hasContent = true;
            break;
          }
        }

        if (!hasContent) {
          console.warn("Canvas appears to be empty or all black");
        }
      } catch (e) {
        console.warn("Could not analyze canvas content", e);
      }

      // Return a promise that resolves with the blob
      return new Promise((resolve, reject) => {
        try {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                console.error("Failed to create blob from canvas");
                reject(new Error("Failed to create image blob"));
                return;
              }
              console.log("Image captured successfully", {
                blobSize: blob.size,
              });
              if (blob.size < 1000) {
                console.warn(
                  "Blob is suspiciously small, may indicate black/empty image",
                );
              }
              resolve(blob);
            },
            "image/jpeg",
            0.9, // Higher quality
          );
        } catch (err) {
          console.error("Error converting canvas to blob:", err);
          reject(err);
        }
      });
    } catch (err) {
      console.error("Error during canvas operations:", err);
      return Promise.reject(err);
    }
  }, [videoRef, canvasRef]);

  // Handle check-in
  const checkIn = useCallback(async () => {
    if (!selectedSessionId) {
      setErrorMessage("Please select a session first");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Initializing camera...");
      setErrorMessage("");

      // Check if camera is working properly
      if (
        !streamRef.current ||
        !videoRef.current ||
        videoRef.current.readyState < 2
      ) {
        console.log("Camera not ready, attempting to restart camera...");
        const cameraStarted = await startCamera();

        if (!cameraStarted) {
          throw new Error("Failed to initialize camera. Please try again.");
        }

        // Give camera time to warm up
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Double-check camera is working
        if (!streamRef.current || !videoRef.current.readyState) {
          throw new Error("Camera initialized but not streaming properly.");
        }
      }

      setMessage("Capturing image...");

      // Ensure video element has valid dimensions before capture
      if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
        console.warn("Video dimensions not available, waiting...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!videoRef.current.videoWidth) {
          throw new Error(
            "Camera not providing video frames. Please try again.",
          );
        }
      }

      // Capture image with additional validation
      const imageBlob = await captureImage();

      if (!imageBlob || imageBlob.size < 5000) {
        throw new Error(
          "Captured image is too small or empty. Please ensure good lighting.",
        );
      }

      setMessage("Processing face recognition...");

      // Create form data
      const formData = new FormData();
      formData.append("file", imageBlob, "attendance.jpg");

      // Send to API
      setMessage("Sending to server...");
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
      console.log("Check-in response:", response.data);
      setMessage(
        `Success! ${
          response.data.user?.full_name ||
          response.data.user?.name ||
          response.data.user_name ||
          "Unknown Student"
        } is ${
          response.data.status === "LATE"
            ? `late (${response.data.late_minutes || 0} minutes).`
            : "on time."
        }`,
      );

      // Add to recent check-ins
      const checkin = {
        id: Date.now(),
        name:
          response.data.user?.full_name ||
          response.data.full_name ||
          response.data.student_name ||
          response.data.user?.name ||
          response.data.user_name ||
          "Unknown Student",
        time: new Date().toLocaleTimeString(),
        status: response.data.status,
        lateMinutes: response.data.late_minutes || 0,
      };

      setRecentCheckins((prev) => [checkin, ...prev.slice(0, 9)]);

      // Reset after 3 seconds
      setTimeout(() => {
        setStatus("scanning");
        setMessage("Waiting to scan...");
      }, 3000);
    } catch (error) {
      console.error("Check-in error:", error);
      setStatus("error");

      // Extract error message from response if available
      const errorMsg =
        error.response?.data?.detail || error.message || "Failed to check in";
      setMessage(errorMsg);
      setErrorMessage(errorMsg);

      // Reset after 3 seconds
      setTimeout(() => {
        setStatus("scanning");
        setMessage("Waiting to scan...");
      }, 3000);
    }
  }, [
    selectedSessionId,
    streamRef,
    videoRef,
    canvasRef,
    setStatus,
    setMessage,
    setErrorMessage,
    captureImage,
    apiService,
    setRecentCheckins,
    startCamera,
  ]);

  return {
    startCamera,
    stopCamera,
    captureImage,
    checkIn,
  };
}
