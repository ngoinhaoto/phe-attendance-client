import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import { 
  SecurityOutlined as SecurityIcon,
  ArrowForward as ArrowIcon 
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const SecuritySettingsCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" fontWeight="medium">
                Account Security
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Manage your password and security settings to keep your administrator account secure.
              Regular password updates are recommended for accounts with administrative privileges.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={3} sx={{ textAlign: { md: "right" } }}>
            <Button 
              variant="contained" 
              color="primary" 
              endIcon={<ArrowIcon />}
              onClick={() => navigate("/dashboard/profile")}
              fullWidth
            >
              Security Settings
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsCard;