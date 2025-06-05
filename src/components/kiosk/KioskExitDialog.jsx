import React, { useState } from 'react';
import './KioskExitDialog.css';

const KioskExitDialog = ({ onExit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onExit(password);
    if (!success) {
      setError('Invalid password');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  if (!isOpen) {
    return (
      <button 
        className="exit-kiosk-button" 
        onClick={() => setIsOpen(true)}
      >
        Exit Kiosk Mode
      </button>
    );
  }
  
  return (
    <div className="kiosk-exit-dialog">
      <form onSubmit={handleSubmit}>
        <h3>Exit Kiosk Mode</h3>
        <p>Enter admin password to exit kiosk mode:</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          autoFocus
        />
        {error && <p className="error-message">{error}</p>}
        <div className="dialog-buttons">
          <button type="button" onClick={() => setIsOpen(false)}>
            Cancel
          </button>
          <button type="submit">
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
};

export default KioskExitDialog;