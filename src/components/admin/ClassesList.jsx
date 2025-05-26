import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import adminService from "../../api/adminService";
import { toast } from "react-toastify";

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Add new class dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newClass, setNewClass] = useState({
    class_code: "",
    name: "",
    description: "",
    semester: "Spring",
    academic_year: new Date().getFullYear().toString(),
    teacher_id: "",
    location: "",
    start_time: new Date(),
    end_time: new Date(new Date().setHours(new Date().getHours() + 1)),
  });
  const [addClassError, setAddClassError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await adminService.getClasses();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      // Get all users and filter teachers
      const users = await adminService.getUsers();
      const teachersList = users.filter((user) => user.role === "teacher");
      setTeachers(teachersList);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Add class dialog handlers
  const handleOpenAddDialog = () => {
    setNewClass({
      class_code: "",
      name: "",
      description: "",
      semester: "Spring",
      academic_year: new Date().getFullYear().toString(),
      teacher_id: teachers.length > 0 ? teachers[0].id.toString() : "", // Use first teacher if available
      location: "",
      start_time: new Date(),
      end_time: new Date(new Date().setHours(new Date().getHours() + 1)),
    });
    setAddClassError("");
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleNewClassChange = (e) => {
    const { name, value } = e.target;
    setNewClass((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (type, event) => {
    setNewClass((prev) => ({ ...prev, [type]: new Date(event.target.value) }));
  };

  // Function to format date for datetime-local input
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    // Format as YYYY-MM-DDThh:mm
    return d.toISOString().slice(0, 16);
  };

  const handleAddClass = async () => {
    try {
      setSubmitLoading(true);
      setAddClassError("");

      // Validate form
      if (
        !newClass.class_code ||
        !newClass.name ||
        !newClass.semester ||
        !newClass.academic_year ||
        !newClass.teacher_id // Make sure teacher_id is not empty
      ) {
        setAddClassError("Required fields are missing");
        setSubmitLoading(false);
        return;
      }

      // Format dates for API
      const classDataForApi = {
        ...newClass,
        // Format dates as ISO strings for the backend
        start_time: newClass.start_time.toISOString(),
        end_time: newClass.end_time.toISOString(),
        // Ensure teacher_id is an integer
        teacher_id: parseInt(newClass.teacher_id, 10),
      };

      // Add the class through the API service
      await adminService.createClass(classDataForApi);

      // Close dialog and refresh list
      setOpenAddDialog(false);
      fetchClasses();

      // Show success message
      toast.success("Class added successfully!");
    } catch (error) {
      console.error("Error adding class:", error);
      if (error.response && error.response.data) {
        setAddClassError(error.response.data.detail || "Failed to add class");
      } else {
        setAddClassError("Failed to add class. Please try again.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Function to get teacher's name by ID
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

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Classes Management
      </Typography>

      <Box sx={{ display: "flex", mb: 3, gap: 2 }}>
        <TextField
          label="Search Classes"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddDialog}
        >
          Add New Class
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredClasses.map((cls) => (
            <Grid item xs={12} sm={6} md={4} key={cls.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {cls.name}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {cls.class_code}
                  </Typography>
                  {cls.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {cls.description}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Teacher: {getTeacherName(cls.teacher, cls.teacher_id)}
                    </Typography>
                    <Typography variant="body2">
                      Students: {cls.students?.length || 0}
                    </Typography>
                    <Typography variant="body2">
                      Sessions: {cls.sessions?.length || 0}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small">View Details</Button>
                  <Button size="small">Edit</Button>
                  <Button size="small" color="error">
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {filteredClasses.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography>No classes found</Typography>
                {searchTerm && (
                  <Typography variant="body2" color="textSecondary">
                    Try changing your search criteria
                  </Typography>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Add Class Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Class</DialogTitle>
        <DialogContent>
          {addClassError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {addClassError}
            </Alert>
          )}
          <DialogContentText>
            Enter the details for the new class. Fields marked with * are
            required.
          </DialogContentText>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                margin="dense"
                name="class_code"
                label="Class Code"
                type="text"
                fullWidth
                variant="outlined"
                value={newClass.class_code}
                onChange={handleNewClassChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                margin="dense"
                name="name"
                label="Class Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newClass.name}
                onChange={handleNewClassChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="description"
                label="Description"
                type="text"
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                value={newClass.description}
                onChange={handleNewClassChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel required id="semester-label">
                  Semester
                </InputLabel>
                <Select
                  labelId="semester-label"
                  name="semester"
                  value={newClass.semester}
                  label="Semester *"
                  onChange={handleNewClassChange}
                >
                  <MenuItem value="Spring">Spring</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                  <MenuItem value="Fall">Fall</MenuItem>
                  <MenuItem value="Winter">Winter</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                margin="dense"
                name="academic_year"
                label="Academic Year"
                type="text"
                fullWidth
                variant="outlined"
                value={newClass.academic_year}
                onChange={handleNewClassChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel required id="teacher-label">
                  Teacher
                </InputLabel>
                <Select
                  labelId="teacher-label"
                  name="teacher_id"
                  value={newClass.teacher_id}
                  label="Teacher *"
                  onChange={handleNewClassChange}
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name || teacher.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="location"
                label="Location"
                type="text"
                fullWidth
                variant="outlined"
                value={newClass.location}
                onChange={handleNewClassChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                margin="dense"
                name="start_time"
                label="Start Time"
                type="datetime-local"
                fullWidth
                variant="outlined"
                value={formatDateForInput(newClass.start_time)}
                onChange={(e) => handleTimeChange("start_time", e)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                margin="dense"
                name="end_time"
                label="End Time"
                type="datetime-local"
                fullWidth
                variant="outlined"
                value={formatDateForInput(newClass.end_time)}
                onChange={(e) => handleTimeChange("end_time", e)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            onClick={handleAddClass}
            variant="contained"
            disabled={submitLoading}
          >
            {submitLoading ? "Adding..." : "Add Class"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassesList;
