import apiService from "./apiService";

const getUsers = async (params = {}) => {
  try {
    const response = await apiService.get("/users", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return empty array instead of throwing
    return [];
  }
};

const getClasses = async () => {
  try {
    const response = await apiService.get("/classes");
    return response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
};

const getClassSessions = async (classId) => {
  try {
    const response = await apiService.get(`/classes/${classId}/sessions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching class sessions:", error);
    return [];
  }
};

const getSessionAttendance = async (sessionId) => {
  try {
    const response = await apiService.get(
      `/attendance/sessions/${sessionId}/students`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching session attendance:", error);
    return [];
  }
};

const adminService = {
  getUsers,
  getClasses,
  getClassSessions,
  getSessionAttendance,
};

export default adminService;
