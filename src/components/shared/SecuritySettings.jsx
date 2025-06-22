import React from "react";
import { Box, Typography, Paper, Divider } from "@mui/material";
import { Security as SecurityIcon } from "@mui/icons-material";
import PasswordChangeForm from "./PasswordChangeForm";

const SecuritySettings = ({ userId }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        mb: 4,
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" component="h2" fontWeight="bold">
          Security Settings
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <PasswordChangeForm userId={userId} />
    </Paper>
  );
};

export default SecuritySettings;
