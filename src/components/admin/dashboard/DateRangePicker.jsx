import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Popover,
  Grid,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";
import {
  format,
  subMonths,
  subDays,
  subYears,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from "date-fns";

const DateRangePicker = ({ onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    // Default to 5 months ago
    return subMonths(new Date(), 5);
  });
  const [endDate, setEndDate] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [activePreset, setActivePreset] = useState("semester"); // Default active preset

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Initialize temp dates with current selections
    setTempStartDate(startDate);
    setTempEndDate(endDate);

    // Detect which preset matches the current date range
    detectActivePreset(startDate, endDate);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    onChange(tempStartDate, tempEndDate);
    handleClose();
  };

  // Function to detect which preset matches the current date range
  const detectActivePreset = (start, end) => {
    const today = new Date();
    const last30Days = subDays(today, 30);
    const last90Days = subDays(today, 90);
    const semester = subMonths(today, 5);
    const lastYear = subYears(today, 1);
    const thisMonth = startOfMonth(today);

    if (isSameDay(start, last30Days)) {
      setActivePreset("last30Days");
    } else if (isSameDay(start, last90Days)) {
      setActivePreset("last90Days");
    } else if (isSameDay(start, semester)) {
      setActivePreset("semester");
    } else if (isSameDay(start, lastYear)) {
      setActivePreset("lastYear");
    } else if (isSameDay(start, thisMonth)) {
      setActivePreset("thisMonth");
    } else {
      setActivePreset("custom");
    }
  };

  const handlePresetRange = (range) => {
    let newStartDate;
    const newEndDate = new Date();

    switch (range) {
      case "last30Days":
        newStartDate = subDays(newEndDate, 30);
        break;
      case "last90Days":
        newStartDate = subDays(newEndDate, 90);
        break;
      case "semester":
        newStartDate = subMonths(newEndDate, 5);
        break;
      case "lastYear":
        newStartDate = subYears(newEndDate, 1);
        break;
      case "thisMonth":
        newStartDate = startOfMonth(newEndDate);
        break;
      default:
        newStartDate = subMonths(newEndDate, 5); // Default to semester
    }

    setTempStartDate(newStartDate);
    setTempEndDate(newEndDate);
    setActivePreset(range);
  };

  const formatDateString = (date) => {
    return format(date, "MMM d, yyyy");
  };

  const displayRange = `${formatDateString(startDate)} - ${formatDateString(
    endDate,
  )}`;

  // Get button styles based on whether it's the active preset
  const getPresetButtonStyle = (presetName) => {
    const isActive = activePreset === presetName;
    return {
      justifyContent: "flex-start",
      textTransform: "none",
      backgroundColor: isActive ? "primary.light" : "transparent",
      color: isActive ? "white" : "primary.main",
      fontWeight: isActive ? "bold" : "normal",
      "&:hover": {
        backgroundColor: isActive ? "primary.main" : "rgba(33, 150, 243, 0.08)",
      },
    };
  };

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<CalendarIcon />}
        endIcon={<ArrowDownIcon />}
        onClick={handleClick}
        color="primary"
        sx={{
          borderRadius: 2,
          px: 2,
          py: 1,
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        {displayRange}
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          elevation: 4,
          sx: {
            p: 2,
            width: 320,
            mt: 0.5,
            borderRadius: 2,
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          Select Date Range
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Presets
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={
                  activePreset === "last30Days" ? "contained" : "outlined"
                }
                size="small"
                onClick={() => handlePresetRange("last30Days")}
                sx={getPresetButtonStyle("last30Days")}
              >
                Last 30 Days
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={
                  activePreset === "last90Days" ? "contained" : "outlined"
                }
                size="small"
                onClick={() => handlePresetRange("last90Days")}
                sx={getPresetButtonStyle("last90Days")}
              >
                Last 90 Days
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={activePreset === "semester" ? "contained" : "outlined"}
                size="small"
                onClick={() => handlePresetRange("semester")}
                sx={getPresetButtonStyle("semester")}
              >
                Semester (5 months)
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={activePreset === "lastYear" ? "contained" : "outlined"}
                size="small"
                onClick={() => handlePresetRange("lastYear")}
                sx={getPresetButtonStyle("lastYear")}
              >
                Last Year
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Custom Range
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={format(tempStartDate, "yyyy-MM-dd")}
                onChange={(e) => setTempStartDate(new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={format(tempEndDate, "yyyy-MM-dd")}
                onChange={(e) => setTempEndDate(new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
                size="small"
                inputProps={{
                  min: format(tempStartDate, "yyyy-MM-dd"),
                  max: format(new Date(), "yyyy-MM-dd"),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleApply} color="primary">
            Apply
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

export default DateRangePicker;
