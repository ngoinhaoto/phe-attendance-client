import React from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button 
} from "@mui/material";
import { 
  LockOutlined as LockIcon,
  ArrowForward as ArrowIcon 
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const SecuritySettingsCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LockIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" component="div">
            Account Security
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage your password and security settings to keep your account secure.
        </Typography>
        
        <Button 
          variant="outlined" 
          color="primary" 
          endIcon={<ArrowIcon />}
          onClick={() => navigate("/dashboard/profile")}
        >
          Manage Security Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsCard;