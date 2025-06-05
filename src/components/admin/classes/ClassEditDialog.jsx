import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Alert,
  CircularProgress,
} from "@mui/material";
// Import the utility function
import { formatDateTimeForInput } from "../../../utils/dateUtils";

const ClassEditDialog = ({
  open,
  classData,
  teachers,
  onClose,
  onUpdateClass,
}) => {
  const [editedClass, setEditedClass] = useState({
    class_code: "",
    name: "",
    description: "",
    semester: "",
    academic_year: "",
    teacher_id: "",
    location: "",
    start_time: new Date(),
    end_time: new Date(),
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load class data when dialog opens
  useEffect(() => {
    if (classData && open) {
      setEditedClass({
        class_code: classData.class_code || "",
        name: classData.name || "",
        description: classData.description || "",
        semester: classData.semester || "Spring",
        academic_year:
          classData.academic_year || new Date().getFullYear().toString(),
        teacher_id: classData.teacher_id ? classData.teacher_id.toString() : "",
        location: classData.location || "",
        start_time: classData.start_time
          ? new Date(classData.start_time)
          : new Date(),
        end_time: classData.end_time
          ? new Date(classData.end_time)
          : new Date(new Date().setHours(new Date().getHours() + 1)),
      });
      setError("");
    }
  }, [classData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedClass((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (type, event) => {
    setEditedClass((prev) => ({
      ...prev,
      [type]: new Date(event.target.value),
    }));
  };

  // Function to format date for datetime-local input
  const formatDateForInput = (date) => {
    return formatDateTimeForInput(date);
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !editedClass.class_code ||
      !editedClass.name ||
      !editedClass.semester ||
      !editedClass.academic_year ||
      !editedClass.teacher_id
    ) {
      setError("Required fields must be filled");
      return;
    }

    // Prepare data for API
    const classDataForApi = {
      ...editedClass,
      // Format dates as ISO strings for the backend
      start_time: editedClass.start_time.toISOString(),
      end_time: editedClass.end_time.toISOString(),
      // Ensure teacher_id is an integer
      teacher_id: parseInt(editedClass.teacher_id, 10),
    };

    setIsSubmitting(true);
    try {
      console.log("Submitting class update:", classDataForApi);
      const result = await onUpdateClass(classData.id, classDataForApi);
      if (result === true) {
        handleClose();
      } else if (result && result.error) {
        setError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!classData) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Class: {classData.name}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>
          Update class details. Fields marked with * are required.
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
              value={editedClass.class_code}
              onChange={handleChange}
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
              value={editedClass.name}
              onChange={handleChange}
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
              value={editedClass.description}
              onChange={handleChange}
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
                value={editedClass.semester}
                label="Semester *"
                onChange={handleChange}
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
              value={editedClass.academic_year}
              onChange={handleChange}
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
                value={editedClass.teacher_id}
                label="Teacher *"
                onChange={handleChange}
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id.toString()}>
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
              value={editedClass.location}
              onChange={handleChange}
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
              value={formatDateForInput(editedClass.start_time)}
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
              value={formatDateForInput(editedClass.end_time)}
              onChange={(e) => handleTimeChange("end_time", e)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassEditDialog;
