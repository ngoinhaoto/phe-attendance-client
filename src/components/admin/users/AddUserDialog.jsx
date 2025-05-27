import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormGroup,
  Switch,
  Alert,
  Collapse,
} from "@mui/material";

const AddUserDialog = ({ open, onClose, onAddUser }) => {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    full_name: "",
    role: "student",
    student_id: "", // Add student_id field
    staff_id: "", // Add staff_id field
    is_active: true,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine which role-specific fields to show
  const showStudentFields = newUser.role === "student";
  const showStaffFields =
    newUser.role === "teacher" || newUser.role === "admin";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));

    // When role changes, clear inappropriate ID fields
    if (name === "role") {
      if (value === "student") {
        setNewUser((prev) => ({ ...prev, staff_id: "", role: value }));
      } else {
        setNewUser((prev) => ({ ...prev, student_id: "", role: value }));
      }
    }
  };

  const handleSwitchChange = (e) => {
    setNewUser((prev) => ({ ...prev, is_active: e.target.checked }));
  };

  const resetForm = () => {
    setNewUser({
      username: "",
      email: "",
      password: "",
      password_confirmation: "",
      full_name: "",
      role: "student",
      student_id: "",
      staff_id: "",
      is_active: true,
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !newUser.username ||
      !newUser.email ||
      !newUser.password ||
      !newUser.password_confirmation ||
      !newUser.full_name
    ) {
      setError("All required fields must be filled");
      return;
    }

    if (newUser.password !== newUser.password_confirmation) {
      setError("Passwords do not match");
      return;
    }

    // Role-specific validation
    if (newUser.role === "student" && !newUser.student_id) {
      setError("Student ID is required for students");
      return;
    }

    if (
      (newUser.role === "teacher" || newUser.role === "admin") &&
      !newUser.staff_id
    ) {
      setError("Staff ID is required for teachers and admins");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAddUser(newUser);
      if (result === true) {
        handleClose();
      } else if (result && result.error) {
        setError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>
          Enter the details of the new user. Fields marked with * are required.
        </DialogContentText>
        <TextField
          required
          margin="dense"
          name="username"
          label="Username"
          type="text"
          fullWidth
          variant="outlined"
          value={newUser.username}
          onChange={handleChange}
          sx={{ mb: 2, mt: 2 }}
        />
        <TextField
          required
          margin="dense"
          name="full_name"
          label="Full Name"
          type="text"
          fullWidth
          variant="outlined"
          value={newUser.full_name}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          required
          margin="dense"
          name="email"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={newUser.email}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          required
          margin="dense"
          name="password"
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          value={newUser.password}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          required
          margin="dense"
          name="password_confirmation"
          label="Confirm Password"
          type="password"
          fullWidth
          variant="outlined"
          value={newUser.password_confirmation}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Role *</FormLabel>
          <RadioGroup
            row
            name="role"
            value={newUser.role}
            onChange={handleChange}
          >
            <FormControlLabel
              value="student"
              control={<Radio />}
              label="Student"
            />
            <FormControlLabel
              value="teacher"
              control={<Radio />}
              label="Teacher"
            />
            <FormControlLabel value="admin" control={<Radio />} label="Admin" />
          </RadioGroup>
        </FormControl>

        {/* Conditional ID fields based on role */}
        <Collapse in={showStudentFields}>
          <TextField
            required
            margin="dense"
            name="student_id"
            label="Student ID"
            type="text"
            fullWidth
            variant="outlined"
            value={newUser.student_id}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Collapse>

        <Collapse in={showStaffFields}>
          <TextField
            required
            margin="dense"
            name="staff_id"
            label="Staff ID"
            type="text"
            fullWidth
            variant="outlined"
            value={newUser.staff_id}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Collapse>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={newUser.is_active}
                onChange={handleSwitchChange}
                name="is_active"
              />
            }
            label="Active"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;
