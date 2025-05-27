import { useState, useEffect } from "react";
import adminService from "../api/adminService";
import { toast } from "react-toastify";

const useClasses = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  // Fetch classes with student data
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await adminService.getClasses();
      console.log("Initial classes data:", data);

      // Update each class with its students
      const classesWithStudents = await Promise.all(
        data.map(async (cls) => {
          try {
            console.log(`Fetching students for class ${cls.id}`);
            const students = await adminService.getClassStudents(cls.id);
            console.log(`Class ${cls.id} has ${students.length} students`);
            return { ...cls, students };
          } catch (err) {
            console.error(`Error fetching students for class ${cls.id}:`, err);
            return { ...cls, students: [] };
          }
        })
      );

      console.log("Classes with students:", classesWithStudents);
      setClasses(classesWithStudents);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const users = await adminService.getUsers();
      const teachersList = users.filter((user) => user.role === "teacher");
      setTeachers(teachersList);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  // Create a new class
  const createClass = async (classData) => {
    setIsOperationLoading(true);
    try {
      // Format dates for API
      const classDataForApi = {
        ...classData,
        start_time: classData.start_time.toISOString(),
        end_time: classData.end_time.toISOString(),
        teacher_id: parseInt(classData.teacher_id, 10),
      };

      await adminService.createClass(classDataForApi);
      await fetchClasses();
      toast.success("Class added successfully!");
      return true;
    } catch (error) {
      console.error("Error adding class:", error);
      const errorMessage = error.response?.data?.detail || "Failed to add class";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsOperationLoading(false);
    }
  };

  // Update a class
  const updateClass = async (classId, classData) => {
    setIsOperationLoading(true);
    try {
      await adminService.updateClass(classId, classData);
      await fetchClasses();
      toast.success("Class updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating class:", error);
      const errorMessage = error.response?.data?.detail || "Failed to update class";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsOperationLoading(false);
    }
  };

  // Delete a class
  const deleteClass = async (classId) => {
    setIsOperationLoading(true);
    try {
      await adminService.deleteClass(classId);
      await fetchClasses();
      toast.success("Class deleted successfully!");
      return true;
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
      return false;
    } finally {
      setIsOperationLoading(false);
    }
  };

  // Format a date for datetime-local input
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    // Format as YYYY-MM-DDThh:mm
    return d.toISOString().slice(0, 16);
  };

  // Get teacher's name by ID or object
  const getTeacherName = (teacherObj, teacherId) => {
    // If we have the full teacher object with name, use it
    if (teacherObj?.full_name || teacherObj?.username) {
      return teacherObj.full_name || teacherObj.username;
    }

    // If we only have the teacher_id, look up the teacher in our teachers array
    if (teacherId) {
      const foundTeacher = teachers.find((t) => t.id === Number(teacherId));
      if (foundTeacher) {
        return foundTeacher.full_name || foundTeacher.username;
      }
    }

    // If no teacher info is available
    return "Not assigned";
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  return {
    classes,
    teachers,
    loading,
    isOperationLoading,
    fetchClasses,
    fetchTeachers,
    createClass,
    updateClass,
    deleteClass,
    formatDateForInput,
    getTeacherName
  };
};

export default useClasses;