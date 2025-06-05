import { format, parseISO } from "date-fns";

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    // Parse the ISO string and display in local timezone
    const date =
      typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    return format(date, "MMMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error, dateStr);
    return dateStr;
  }
};

export const formatTime = (dateStr) => {
  if (!dateStr) return "";
  try {
    // Parse the ISO string and display in local timezone
    const date =
      typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    return format(date, "h:mm a");
  } catch (error) {
    console.error("Error formatting time:", error, dateStr);
    return dateStr;
  }
};

// Add new utility functions
export const formatDateTimeForInput = (date) => {
  if (!date) return "";

  // Ensure we have a Date object
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Get local parts
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  // Format as YYYY-MM-DDThh:mm (standard format for datetime-local inputs)
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper to determine if a session is still active
export const isSessionActive = (session) => {
  if (!session) return false;

  const now = new Date();
  const sessionDate = new Date(session.session_date);

  // Check if same day
  if (sessionDate.toDateString() !== now.toDateString()) {
    return false;
  }

  // Check if current time is within session times
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);

  return now >= startTime && now <= endTime;
};

// Helper to check if a session is valid (not ended)
export const isSessionValid = (session) => {
  if (!session) return false;

  const now = new Date();
  const sessionDate = new Date(session.session_date);
  const endTime = new Date(session.end_time);

  // Check if session is today
  if (sessionDate.toDateString() !== now.toDateString()) {
    return false;
  }

  // Check if session hasn't ended
  if (endTime < now) {
    return false;
  }

  return true;
};
