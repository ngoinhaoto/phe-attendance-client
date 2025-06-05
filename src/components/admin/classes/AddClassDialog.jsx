import React, { useState } from "react";
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
} from "@mui/material";
// Import the utility function
import { formatDateTimeForInput } from "../../../utils/dateUtils";

const AddClassDialog = ({ open, teachers, onClose, onAddClass }) => {
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
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setNewClass({
        class_code: "",
        name: "",
        description: "",
        semester: "Spring",
        academic_year: new Date().getFullYear().toString(),
        teacher_id: teachers.length > 0 ? teachers[0].id.toString() : "",
        location: "",
        start_time: new Date(),
        end_time: new Date(new Date().setHours(new Date().getHours() + 1)),
      });
      setError("");
    }
  }, [open, teachers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewClass((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (type, event) => {
    setNewClass((prev) => ({ ...prev, [type]: new Date(event.target.value) }));
  };

  // Function to format date for datetime-local input
  const formatDateForInput = (date) => {
    return formatDateTimeForInput(date);
  };

  const handleSubmit = async () => {
    // Validate form
    if (
      !newClass.class_code ||
      !newClass.name ||
      !newClass.semester ||
      !newClass.academic_year ||
      !newClass.teacher_id
    ) {
      setError("Required fields are missing");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAddClass(newClass);
      if (result === true) {
        onClose();
      } else if (result && result.error) {
        setError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Class</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
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
              value={newClass.name}
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
              value={newClass.description}
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
                value={newClass.semester}
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
              value={newClass.academic_year}
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
                value={newClass.teacher_id}
                label="Teacher *"
                onChange={handleChange}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Class"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddClassDialog;
