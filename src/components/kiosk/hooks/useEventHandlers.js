import { useCallback } from 'react';

export default function useEventHandlers({
  setSelectedClassId,
  setSelectedSessionId,
  setSessions,
  setSessionInfo,
  navigate,
  selectedClassId
}) {
  // Handle class selection - Navigate to class URL
  const handleClassChange = useCallback((e) => {
    const newClassId = e.target.value;

    // Reset session state when class changes
    setSelectedSessionId("");
    setSessions([]);
    setSessionInfo(null);

    if (newClassId) {
      // Update URL with selected class
      navigate(`/kiosk/class/${newClassId}`, { replace: true });
    } else {
      // Reset to base kiosk URL
      navigate("/kiosk", { replace: true });
    }
  }, [setSelectedSessionId, setSessions, setSessionInfo, navigate]);

  // Handle session selection - Navigate to session URL
  const handleSessionChange = useCallback((e) => {
    const newSessionId = e.target.value;

    if (newSessionId && selectedClassId) {
      // Update URL with selected class and session
      navigate(`/kiosk/class/${selectedClassId}/session/${newSessionId}`, {
        replace: true,
      });
    } else if (selectedClassId) {
      // Go back to class selection if no session selected
      navigate(`/kiosk/class/${selectedClassId}`, { replace: true });
    } else {
      // Fallback to base kiosk URL
      navigate("/kiosk", { replace: true });
    }
  }, [navigate, selectedClassId]);

  // Handle "Back to Session Selection" button
  const handleBackToSessionSelection = useCallback(() => {
    setSessionInfo(null);
    setSelectedSessionId("");

    if (selectedClassId) {
      navigate(`/kiosk/class/${selectedClassId}`, { replace: true });
    } else {
      navigate("/kiosk", { replace: true });
    }
  }, [setSessionInfo, setSelectedSessionId, navigate, selectedClassId]);

  return {
    handleClassChange,
    handleSessionChange,
    handleBackToSessionSelection
  };
}