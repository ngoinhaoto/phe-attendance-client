import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  AssignmentInd as RoleIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const UserCards = ({ users, onViewDetails, onEditUser, onDeleteUser }) => {
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
    <Grid container spacing={3}>
      {users.slice(0, 4).map((user) => (
        <Grid item xs={12} sm={6} md={3} key={`card-${user.id}`}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderLeft: `4px solid ${
                user.role === "admin"
                  ? "#f44336"
                  : user.role === "teacher"
                  ? "#1976d2"
                  : "#4caf50"
              }`,
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1.5,
                  gap: 1,
                }}
              >
                <PersonIcon sx={{ color: "text.secondary" }} />
                <Typography variant="h6" component="div" noWrap>
                  {user.full_name || user.username}
                </Typography>
              </Box>

              {/* Add username as a subtitle if full name exists */}
              {user.full_name && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", ml: 4, mt: -1, mb: 1 }}
                  noWrap
                >
                  @{user.username}
                </Typography>
              )}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                  gap: 1,
                }}
              >
                <EmailIcon sx={{ color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                  gap: 1,
                }}
              >
                <RoleIcon sx={{ color: "text.secondary" }} />
                <Chip
                  label={user.role}
                  color={getRoleColor(user.role)}
                  size="small"
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {user.is_active ? (
                  <ActiveIcon
                    sx={{ color: "success.main", fontSize: "small" }}
                  />
                ) : (
                  <InactiveIcon
                    sx={{ color: "text.disabled", fontSize: "small" }}
                  />
                )}
                <Typography variant="body2">
                  {user.is_active ? "Active" : "Inactive"}
                </Typography>
              </Box>
            </CardContent>
            <Box
              sx={{
                p: 1,
                pt: 0,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Tooltip title="View Details">
                <IconButton size="small" onClick={() => onViewDetails(user)}>
                  <PersonIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit User">
                <IconButton size="small" onClick={() => onEditUser(user)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete User">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDeleteUser(user)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default UserCards;
