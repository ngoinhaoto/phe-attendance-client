import { useCallback, useEffect } from 'react';

export default function useKioskMode({ setKioskMode, user }) {
  // Enable kiosk mode with enhanced security
  const enableKioskMode = useCallback(() => {
    setKioskMode(true);
    
    // Store kiosk mode in session storage
    sessionStorage.setItem("kioskMode", "true");
    
    // Enter fullscreen for better security
    document.documentElement.requestFullscreen().catch((err) => {
      console.error("Couldn't enter fullscreen mode:", err);
    });
    
    // Additional security - disable context menu
    const disableContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', disableContextMenu);
    
    // Store the event listener removal function
    window._kioskCleanup = () => {
      document.removeEventListener('contextmenu', disableContextMenu);
    };
    
    // Disable keyboard shortcuts that could navigate away
    const blockKeyboardShortcuts = (e) => {
      // Block Alt+Left/Right (browser navigation)
      // Block Ctrl+L (address bar)
      // Block F5 (refresh)
      if (
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) ||
        (e.ctrlKey && e.key === 'l') ||
        e.key === 'F5'
      ) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', blockKeyboardShortcuts);
    window._kioskCleanup = (...funcs) => {
      document.removeEventListener('contextmenu', disableContextMenu);
      window.removeEventListener('keydown', blockKeyboardShortcuts);
    };
  }, [setKioskMode]);

  // Disable kiosk mode with proper cleanup
  const disableKioskMode = useCallback((password) => {
    // Simple authentication - in production use a more secure method
    if (password === user?.username || password === "admin123") {
      setKioskMode(false);
      sessionStorage.removeItem("kioskMode");
      
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error("Error exiting fullscreen:", err);
        });
      }
      
      // Clean up event listeners
      if (window._kioskCleanup) {
        window._kioskCleanup();
      }
      
      return true;
    }
    return false;
  }, [setKioskMode, user]);

  // This handles cases where the component unmounts while in kiosk mode
  useEffect(() => {
    return () => {
      // On component unmount, if we were in kiosk mode, clean up
      if (sessionStorage.getItem("kioskMode") === "true") {
        if (window._kioskCleanup) {
          window._kioskCleanup();
        }
      }
    };
  }, []);

  return {
    enableKioskMode,
    disableKioskMode
  };
}