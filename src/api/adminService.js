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

const createUser = async (userData) => {
  try {
    const response = await apiService.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const response = await apiService.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
const createClass = async (classData) => {
  try {
    const response = await apiService.post("/classes", classData);
    return response.data;
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
};

const adminService = {
  getUsers,
  getClasses,

  getClassSessions,
  getSessionAttendance,
  createUser,
  deleteUser,

  createClass,
};

export default adminService;
