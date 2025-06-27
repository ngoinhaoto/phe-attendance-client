import apiService from "./apiService";
import { getCachedData, setCachedData } from "../utils/apiCache";
import { clearCacheKey, clearCachePattern } from "../utils/apiCache";
// Track in-flight requests to prevent duplicates
const pendingRequests = {};

// Helper to handle API requests with caching
const cachedRequest = async (cacheKey, requestFn) => {
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    console.log(`Using cached data for ${cacheKey}`);
    return cachedData;
  }

  // Check if there's already a pending request for this key
  if (pendingRequests[cacheKey]) {
    console.log(`Request already in progress for ${cacheKey}, reusing promise`);
    return pendingRequests[cacheKey];
  }

  // Create and store the request promise
  try {
    console.log(`Fetching data for ${cacheKey}`);
    const requestPromise = requestFn();
    pendingRequests[cacheKey] = requestPromise;

    const result = await requestPromise;
    setCachedData(cacheKey, result);
    return result;
  } finally {
    // Clear the pending request reference
    delete pendingRequests[cacheKey];
  }
};

// Get all classes (with students if requested)
const getClasses = async () => {
  return cachedRequest("classes", async () => {
    try {
      const response = await apiService.get("/classes", {
        params: { include_students: true },
      });

      // Ensure the students array exists for each class
      const classes = response.data.map((cls) => ({
        ...cls,
        students: cls.students || [],
      }));

      return classes;
    } catch (error) {
      console.error("Error fetching classes:", error);
      return [];
    }
  });
};

// Get students for a specific class
const getClassStudents = async (classId) => {
  return cachedRequest(`class_students_${classId}`, async () => {
    try {
      console.log(`Fetching students for class ${classId}`);
      const response = await apiService.get(`/classes/${classId}/students`);
      console.log(`Class ${classId} students response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching class students for class ${classId}:`,
        error,
      );
      return [];
    }
  });
};

// Get all users (with caching)
const getUsers = async (params = {}) => {
  const cacheKey = `users_${JSON.stringify(params)}`;
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    console.log("Using cached users data");
    return cachedData;
  }

  try {
    const response = await apiService.get("/users", { params });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return empty array instead of throwing
    return [];
  }
};

// Update the getClasses function to ensure we get all the data including students

const getAllClasses = async () => {
  const cacheKey = "all_classes";
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    console.log("Using cached all classes data");
    return cachedData;
  }

  try {
    const response = await apiService.get("/classes", {
      params: { include_students: true }, // Add this parameter if supported by your API
    });

    // Log the response to debug
    console.log("All Classes response:", response.data);

    // Ensure the students array exists for each class
    const classes = response.data.map((cls) => ({
      ...cls,
      students: cls.students || [],
    }));

    setCachedData(cacheKey, classes);
    return classes;
  } catch (error) {
    console.error("Error fetching all classes:", error);
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

// CREATE operations
const createUser = async (userData) => {
  try {
    const response = await apiService.post("/users", userData);

    // Clear relevant cache entries
    clearCacheKey("users");
    clearCachePattern("users_");

    // If it's a student, they might be added to classes
    if (userData.role === "student") {
      clearCachePattern("class_students_");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const createClass = async (classData) => {
  try {
    const response = await apiService.post("/classes", classData);

    // Clear classes cache
    clearCacheKey("classes");
    clearCacheKey("all_classes");

    return response.data;
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
};

const createClassSession = async (sessionData) => {
  try {
    const response = await apiService.post("/classes/sessions", sessionData);

    // Clear related caches
    if (sessionData.class_id) {
      clearCachePattern(`class_${sessionData.class_id}`);
    }

    // Clear dashboard data as new sessions affect analytics
    clearCachePattern("dashboard_");

    return response.data;
  } catch (error) {
    console.error("Error creating class session:", error);
    throw error;
  }
};

// DELETE operations
const deleteUser = async (userId) => {
  try {
    const response = await apiService.delete(`/users/${userId}`);

    // Clear relevant caches
    clearCacheKey("users");
    clearCachePattern("users_");
    clearCachePattern(`user_${userId}`);

    // User might be in classes, so clear class-related caches
    clearCachePattern("class_students_");
    clearCachePattern("classes");

    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

const deleteClass = async (classId) => {
  try {
    const response = await apiService.delete(`/classes/${classId}`);

    // Clear relevant caches
    clearCacheKey("classes");
    clearCacheKey("all_classes");
    clearCachePattern(`class_${classId}`);

    // Also clear dashboard data
    clearCachePattern("dashboard_");

    return response.data;
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
};

const deleteClassSession = async (sessionId) => {
  try {
    const response = await apiService.delete(`/classes/sessions/${sessionId}`);

    // Clear caches related to sessions
    // We don't know the class ID here, so clear all class-related caches
    clearCachePattern("class_");

    // Also clear dashboard data
    clearCachePattern("dashboard_");

    return response.data;
  } catch (error) {
    console.error("Error deleting class session:", error);
    throw error;
  }
};

// UPDATE operations
const updateUser = async (userId, userData) => {
  try {
    console.log("Sending update for user:", userId, "with data:", userData);
    const response = await apiService.put(`/users/${userId}`, userData);

    // Clear related cache entries when a user is updated
    clearCacheKey("users");
    clearCachePattern("users_");
    clearCachePattern(`user_${userId}`);

    // If it's a student, also clear class student caches
    if (userData.role === "student") {
      clearCachePattern("class_students_");
      clearCachePattern("classes"); // Clear classes cache since it includes student data
    }

    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};

const updateClass = async (classId, classData) => {
  try {
    console.log("Sending update for class:", classId, "with data:", classData);
    const response = await apiService.put(`/classes/${classId}`, classData);
    console.log("Update response:", response.data);

    // Clear all class-related caches
    clearCacheKey("classes");
    clearCacheKey("all_classes");
    clearCachePattern(`class_${classId}`);

    // Clear dashboard data
    clearCachePattern("dashboard_");

    return response.data;
  } catch (error) {
    console.error("Error updating class:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};

const updateClassSession = async (sessionId, sessionData) => {
  try {
    const response = await apiService.put(
      `/classes/sessions/${sessionId}`,
      sessionData,
    );

    // Clear all relevant caches
    if (sessionData.class_id) {
      clearCachePattern(`class_${sessionData.class_id}`);
    }

    // Clear dashboard data
    clearCachePattern("dashboard_");

    return response.data;
  } catch (error) {
    console.error("Error updating class session:", error);
    throw error;
  }
};

// STUDENT-CLASS relationship operations
const addStudentToClass = async (classId, studentId) => {
  try {
    const response = await apiService.post(
      `/classes/${classId}/students/${studentId}`,
    );

    // Clear relevant caches
    clearCachePattern(`class_${classId}`);
    clearCachePattern(`class_students_${classId}`);
    clearCacheKey("classes");
    clearCacheKey("all_classes");

    return response.data;
  } catch (error) {
    console.error("Error adding student to class:", error);
    throw error;
  }
};

const removeStudentFromClass = async (classId, studentId) => {
  try {
    console.log(`Removing student ${studentId} from class ${classId}`);
    const response = await apiService.delete(
      `/classes/${classId}/students/${studentId}`,
    );

    // Clear relevant caches
    clearCachePattern(`class_${classId}`);
    clearCachePattern(`class_students_${classId}`);
    clearCacheKey("classes");
    clearCacheKey("all_classes");

    console.log("Remove student response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error removing student from class:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};

// ATTENDANCE operations
const updateAttendanceStatus = async (sessionId, studentId, status) => {
  try {
    const response = await apiService.put(
      `/attendance/sessions/${sessionId}/students/${studentId}`,
      {
        status: status,
      },
    );

    // Clear attendance-related caches
    clearCachePattern(`attendance_session_${sessionId}`);

    // Clear dashboard data since attendance affects statistics
    clearCachePattern("dashboard_");

    return response.data;
  } catch (error) {
    console.error("Error updating attendance status:", error);
    throw error;
  }
};

// Add this to your adminService.js
const getDashboardData = async (dateRange) => {
  const cacheKey = `dashboard_${dateRange.startDate}_${dateRange.endDate}`;
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    console.log("Using cached dashboard data");
    return cachedData;
  }

  try {
    const response = await apiService.get("/admin/dashboard", {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    });

    // Ensure we have all expected fields
    const data = {
      users: response.data?.users || {
        total: 0,
        admins: 0,
        teachers: 0,
        students: 0,
      },
      classes: response.data?.classes || [],
      activityData: response.data?.activityData || [],
      classesWithSizes: response.data?.classesWithSizes || [],
    };

    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return empty structure instead of throwing
    return {
      users: { total: 0, admins: 0, teachers: 0, students: 0 },
      classes: [],
      activityData: [],
      classesWithSizes: [],
    };
  }
};

const adminService = {
  getUsers,
  getClasses,
  getClassStudents,
  getClassSessions,
  getSessionAttendance,
  createUser,
  deleteUser,
  createClass,
  updateClass,
  deleteClass,
  updateUser,
  addStudentToClass,
  removeStudentFromClass,
  createClassSession, // Add this
  updateClassSession, // Add this
  deleteClassSession, // Add this
  updateAttendanceStatus, // Add this
  getDashboardData, // Add this
};

export default adminService;
