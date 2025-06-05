import React from 'react';

const KioskControls = ({
  status,
  sessionInfo,
  loadingSession,
  checkIn,
  handleBackToSessionSelection
}) => {
  return (
    <div className="controls">
      <button
        className="capture-button"
        onClick={checkIn}
        disabled={status === "processing" || !sessionInfo || loadingSession}
      >
        {sessionInfo ? "Check In Student" : "Select a Session First"}
      </button>

      {sessionInfo && (
        <button
          className="secondary-button"
          onClick={handleBackToSessionSelection}
        >
          Back to Session Selection
        </button>
      )}
    </div>
  );
};

export default KioskControls;