import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  AssignmentInd as RoleIcon,
  Today as DateIcon,
  VpnKey as KeyIcon,
} from "@mui/icons-material";

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return (
      <Box>
        <Typography variant="h6">User information not available</Typography>
      </Box>
    );
  }

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

  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  bgcolor:
                    user.role === "admin"
                      ? "#f44336"
                      : user.role === "teacher"
                      ? "#1976d2"
                      : "#4caf50",
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user.full_name || user.username}
              </Typography>
              <Chip
                label={user.role}
                color={getRoleColor(user.role)}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Username" secondary={user.username} />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText primary="Email Address" secondary={user.email} />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <RoleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Role"
                  secondary={
                    <Chip
                      size="small"
                      label={
                        user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      }
                      color={getRoleColor(user.role)}
                    />
                  }
                />
              </ListItem>

              {user.created_at && (
                <ListItem>
                  <ListItemIcon>
                    <DateIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account Created"
                    secondary={formatDate(user.created_at)}
                  />
                </ListItem>
              )}

              <ListItem>
                <ListItemIcon>
                  <KeyIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Account Status"
                  secondary={
                    <Chip
                      size="small"
                      label={user.is_active ? "Active" : "Inactive"}
                      color={user.is_active ? "success" : "default"}
                    />
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;
