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

// Update the getClasses function to ensure we get all the data including students

const getClasses = async () => {
  try {
    const response = await apiService.get("/classes", {
      params: { include_students: true }, // Add this parameter if supported by your API
    });

    // Log the response to debug
    console.log("Classes response:", response.data);

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

const updateUser = async (userId, userData) => {
  try {
    console.log("Sending update for user:", userId, "with data:", userData);
    const response = await apiService.put(`/users/${userId}`, userData);
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

const deleteClass = async (classId) => {
  try {
    const response = await apiService.delete(`/classes/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
};

// Update the getClassStudents function to properly return data

// Get students for a specific class
const getClassStudents = async (classId) => {
  try {
    console.log(`Fetching students for class ${classId}`);
    const response = await apiService.get(`/classes/${classId}/students`);
    console.log(`Class ${classId} students response:`, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching class students:", error);
    return [];
  }
};

// Add a student to a class
const addStudentToClass = async (classId, studentId) => {
  try {
    const response = await apiService.post(
      `/classes/${classId}/students/${studentId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error adding student to class:", error);
    throw error;
  }
};

// Remove a student from a class
const removeStudentFromClass = async (classId, studentId) => {
  try {
    console.log(`Removing student ${studentId} from class ${classId}`);
    // Your backend uses a URL parameter pattern, not a request body
    const response = await apiService.delete(
      `/classes/${classId}/students/${studentId}`
    );
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

const adminService = {
  getUsers,
  getClasses,
  getClassSessions,
  getSessionAttendance,
  createUser,
  deleteUser,
  createClass,
  updateClass,
  deleteClass,
  updateUser,
  getClassStudents,
  addStudentToClass,
  removeStudentFromClass,
};

export default adminService;
