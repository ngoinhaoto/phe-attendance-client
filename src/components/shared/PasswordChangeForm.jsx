import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Collapse,
} from "@mui/material";
import { LockOutlined as LockIcon } from "@mui/icons-material";
import userService from "../../api/userService";

const PasswordChangeForm = ({ userId, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    setError("");

    if (!currentPassword) {
      setError("Current password is required");
      return false;
    }

    if (!newPassword) {
      setError("New password is required");
      return false;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return false;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await userService.changePassword(userId, currentPassword, newPassword);
      setSuccess(true);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      if (error.message === "Current password is incorrect") {
        setError("The current password you entered is incorrect");
      } else {
        setError(
          error.response?.data?.detail ||
            "Failed to change password. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <LockIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" component="h2">
          Change Password
        </Typography>
      </Box>

      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Collapse>

      <Collapse in={success}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Password changed successfully!
        </Alert>
      </Collapse>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Current Password"
          type="password"
          fullWidth
          margin="normal"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          variant="outlined"
          size="small"
          required
        />

        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          variant="outlined"
          size="small"
          helperText="Password must be at least 8 characters long"
          required
        />

        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          variant="outlined"
          size="small"
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : "Change Password"}
        </Button>
      </form>
    </Paper>
  );
};

export default PasswordChangeForm;
