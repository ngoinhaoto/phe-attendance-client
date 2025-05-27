import React, { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";

const EditUserDialog = ({ open, user, onClose, onUpdateUser }) => {
  const [editedUser, setEditedUser] = useState({
    username: "",
    email: "",
    full_name: "",
    role: "student",
    student_id: "",
    staff_id: "",
    is_active: true,
    password: "", // Optional for editing
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine which role-specific fields to show
  const showStudentFields = editedUser.role === "student";
  const showStaffFields =
    editedUser.role === "teacher" || editedUser.role === "admin";

  // Load user data when dialog opens
  useEffect(() => {
    if (user && open) {
      setEditedUser({
        username: user.username || "",
        email: user.email || "",
        full_name: user.full_name || "",
        role: user.role || "student",
        student_id: user.student_id || "",
        staff_id: user.staff_id || "",
        is_active: user.is_active !== undefined ? user.is_active : true,
        password: "",
        password_confirmation: "",
      });
      setError("");
    }
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));

    // When role changes, clear inappropriate ID fields
    if (name === "role") {
      if (value === "student") {
        setEditedUser((prev) => ({ ...prev, staff_id: "", role: value }));
      } else {
        setEditedUser((prev) => ({ ...prev, student_id: "", role: value }));
      }
    }
  };

  const handleSwitchChange = (e) => {
    setEditedUser((prev) => ({ ...prev, is_active: e.target.checked }));
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    // Validation
    if (!editedUser.username || !editedUser.email || !editedUser.full_name) {
      setError("Required fields must be filled");
      return;
    }

    // Validate password matching if the user entered a password
    if (
      editedUser.password &&
      editedUser.password !== editedUser.password_confirmation
    ) {
      setError("Passwords do not match");
      return;
    }

    // Role-specific validation
    if (editedUser.role === "student" && !editedUser.student_id) {
      setError("Student ID is required for students");
      return;
    }

    if (
      (editedUser.role === "teacher" || editedUser.role === "admin") &&
      !editedUser.staff_id
    ) {
      setError("Staff ID is required for teachers and admins");
      return;
    }

    // Prepare data for API (only include password if it was changed)
    const updateData = { ...editedUser };

    updateData.full_name = editedUser.full_name.trim();

    // Remove password_confirmation as the backend doesn't need it
    if (!updateData.password) {
      delete updateData.password;
    }
    delete updateData.password_confirmation;

    // Ensure user IDs are properly formatted
    if (updateData.role === "student") {
      updateData.student_id = updateData.student_id.trim();
      delete updateData.staff_id;
    } else {
      updateData.staff_id = updateData.staff_id.trim();
      delete updateData.student_id;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting user update:", updateData);
      const result = await onUpdateUser(user.id, updateData);
      if (result === true) {
        handleClose();
      } else if (result && result.error) {
        setError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User: {user.username}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>
          Update user details. Fields marked with * are required.
        </DialogContentText>
        <TextField
          required
          margin="dense"
          name="username"
          label="Username"
          type="text"
          fullWidth
          variant="outlined"
          value={editedUser.username}
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
          value={editedUser.full_name}
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
          value={editedUser.email}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Role *</FormLabel>
          <RadioGroup
            row
            name="role"
            value={editedUser.role}
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
            value={editedUser.student_id}
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
            value={editedUser.staff_id}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Collapse>

        <TextField
          margin="dense"
          name="password"
          label="New Password (leave blank to keep current)"
          type="password"
          fullWidth
          variant="outlined"
          value={editedUser.password}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <Collapse in={!!editedUser.password}>
          <TextField
            margin="dense"
            name="password_confirmation"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={editedUser.password_confirmation}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Collapse>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={editedUser.is_active}
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
          {isSubmitting ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
