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
  useTheme,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  AssignmentInd as RoleIcon,
  Today as DateIcon,
  VpnKey as KeyIcon,
  School as SchoolIcon,
} from "@mui/icons-material";

// Import our new PasswordChangeForm component
import PasswordChangeForm from "./PasswordChangeForm";

const UserProfile = () => {
  const theme = useTheme();
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
        return ["#FF8A65", "#FF5722"]; // Orange gradient
      case "teacher":
        return ["#90CAF9", "#2196F3"]; // Blue gradient
      case "student":
        return ["#A5D6A7", "#4CAF50"]; // Green gradient
      default:
        return ["#E0E0E0", "#9E9E9E"]; // Gray gradient
    }
  };

  const getAvatarGradient = (role) => {
    const [color1, color2] = getRoleColor(role);
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  };

  const getBackgroundGradient = (role) => {
    const [color1, color2] = getRoleColor(role);
    return `linear-gradient(135deg, ${color1}30 0%, ${color2}10 100%)`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleString();
  };

  const roleText = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <Box
      sx={{
        pt: 2,
        background: getBackgroundGradient(user.role),
        borderRadius: 3,
        minHeight: "calc(100vh - 150px)",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          textAlign: "center",
          fontWeight: "bold",
          color: theme.palette.text.primary,
          textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        My Profile
      </Typography>

      <Grid container spacing={4} sx={{ px: 3 }}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={4}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100px",
                background: getAvatarGradient(user.role),
                zIndex: 0,
              },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
                zIndex: 1,
                pt: 7,
              }}
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mb: 3,
                  mt: -8,
                  border: "5px solid white",
                  background: getAvatarGradient(user.role),
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                {user.full_name || user.username}
              </Typography>
              <Chip
                label={roleText}
                sx={{
                  mb: 1,
                  background: getAvatarGradient(user.role),
                  color: "white",
                  fontWeight: "bold",
                  px: 1,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </CardContent>
          </Card>

          {/* Add Password Change Form Here */}
          <Box mt={3}>
            <PasswordChangeForm userId={user.id} />
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              borderRadius: 4,
              height: "100%",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                "&::before": {
                  content: '""',
                  display: "block",
                  width: "4px",
                  height: "24px",
                  background: getAvatarGradient(user.role),
                  marginRight: "10px",
                  borderRadius: "4px",
                },
              }}
            >
              Account Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <List>
              <ListItem
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.03)" },
                }}
              >
                <ListItemIcon>
                  <PersonIcon sx={{ color: getRoleColor(user.role)[1] }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography fontWeight="medium">Username</Typography>
                  }
                  secondary={user.username}
                />
              </ListItem>

              <ListItem
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.03)" },
                }}
              >
                <ListItemIcon>
                  <EmailIcon sx={{ color: getRoleColor(user.role)[1] }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography fontWeight="medium">Email Address</Typography>
                  }
                  secondary={user.email}
                />
              </ListItem>

              <ListItem
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.03)" },
                }}
              >
                <ListItemIcon>
                  <RoleIcon sx={{ color: getRoleColor(user.role)[1] }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography fontWeight="medium">Role</Typography>}
                  secondary={
                    <Chip
                      size="small"
                      label={roleText}
                      sx={{
                        background: getAvatarGradient(user.role),
                        color: "white",
                        fontWeight: "medium",
                        mt: 0.5,
                      }}
                    />
                  }
                />
              </ListItem>

              {user.created_at && (
                <ListItem
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    "&:hover": { bgcolor: "rgba(0,0,0,0.03)" },
                  }}
                >
                  <ListItemIcon>
                    <DateIcon sx={{ color: getRoleColor(user.role)[1] }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography fontWeight="medium">
                        Account Created
                      </Typography>
                    }
                    secondary={formatDate(user.created_at)}
                  />
                </ListItem>
              )}

              <ListItem
                sx={{
                  borderRadius: 2,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.03)" },
                }}
              >
                <ListItemIcon>
                  <KeyIcon sx={{ color: getRoleColor(user.role)[1] }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography fontWeight="medium">Account Status</Typography>
                  }
                  secondary={
                    <Chip
                      size="small"
                      label={user.is_active ? "Active" : "Inactive"}
                      sx={{
                        background: user.is_active
                          ? "linear-gradient(135deg, #A5D6A7 0%, #4CAF50 100%)"
                          : "linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)",
                        color: "white",
                        fontWeight: "medium",
                        mt: 0.5,
                      }}
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
