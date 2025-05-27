import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
} from "@mui/material";

const UserDetailsDialog = ({ open, user, onClose, onDelete, onEdit }) => {
  if (!user) return null;

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "teacher":
        return "primary";
      case "student":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>User Details: {user.username}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Username</Typography>
              <Typography variant="body1">{user.username}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Full Name</Typography>
              <Typography variant="body1">{user.full_name || "-"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Email</Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Role</Typography>
              <Chip
                label={user.role}
                color={getRoleColor(user.role)}
                size="small"
              />
            </Grid>

            {/* Student ID (only show for students) */}
            {user.role === "student" && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Student ID</Typography>
                <Typography variant="body1">
                  {user.student_id || "-"}
                </Typography>
              </Grid>
            )}

            {/* Staff ID (only show for teachers and admins) */}
            {(user.role === "teacher" || user.role === "admin") && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Staff ID</Typography>
                <Typography variant="body1">{user.staff_id || "-"}</Typography>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Status</Typography>
              <Chip
                label={user.is_active ? "Active" : "Inactive"}
                color={user.is_active ? "success" : "default"}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Created At</Typography>
              <Typography variant="body1">
                {new Date(user.created_at).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={() => {
            onClose();
            onEdit(user);
          }}
        >
          Edit User
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            onClose();
            onDelete(user);
          }}
        >
          Delete User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsDialog;
