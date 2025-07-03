import React from "react";
import { useSelector } from "react-redux";
import { Chip, Tooltip, CircularProgress } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ErrorIcon from "@mui/icons-material/Error";

const PHEStatusIndicator = () => {
  const { status } = useSelector((state) => state.phe);

  // Status configurations
  const statusConfig = {
    checking: {
      label: "Checking PHE Status",
      color: "default",
      icon: <CircularProgress size={16} />,
      tooltip: "Checking if PHE encryption is available",
    },
    enabled: {
      label: "PHE Secure",
      color: "success",
      icon: <LockIcon fontSize="small" />,
      tooltip: "Face recognition is using Private Homomorphic Encryption",
    },
    disabled: {
      label: "PHE Unavailable",
      color: "warning",
      icon: <LockOpenIcon fontSize="small" />,
      tooltip: "Using standard face recognition without PHE",
    },
    error: {
      label: "PHE Error",
      color: "error",
      icon: <ErrorIcon fontSize="small" />,
      tooltip: "Could not determine PHE status",
    },
  };

  // Determine which config to use (with fallback to avoid the undefined error)
  const config = statusConfig[status] || statusConfig.error;

  return (
    <Tooltip title={config.tooltip}>
      <Chip
        size="small"
        icon={config.icon}
        label={config.label}
        color={config.color}
        variant="outlined"
        sx={{ ml: 1 }}
      />
    </Tooltip>
  );
};

export default PHEStatusIndicator;
