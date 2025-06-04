import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import {
  CheckCircle as PresentIcon,
  Warning as LateIcon,
  Cancel as AbsentIcon
} from '@mui/icons-material';
import { formatDate, formatTime } from '../../../utils/dateUtils';

const RecentAttendanceList = ({ attendance }) => {
  const getStatusChip = (status, lateMinutes = 0) => {
    switch (status) {
      case 'PRESENT':
        return (
          <Chip
            icon={<PresentIcon />}
            label="Present"
            color="success"
            size="small"
          />
        );
      case 'LATE':
        return (
          <Chip
            icon={<LateIcon />}
            label={`Late (${lateMinutes} min)`}
            color="warning"
            size="small"
          />
        );
      case 'ABSENT':
        return (
          <Chip
            icon={<AbsentIcon />}
            label="Absent"
            color="error"
            size="small"
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Attendance
      </Typography>

      {attendance.length > 0 ? (
        <List>
          {attendance.map((record) => (
            <ListItem key={record.id} divider>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">
                      {record.class_name} ({record.class_code})
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}
                  >
                    <Typography variant="body2">
                      {formatDate(record.session_date)}
                    </Typography>
                    <Typography variant="body2">
                      {formatTime(record.start_time)} - {formatTime(record.end_time)}
                    </Typography>
                  </Box>
                }
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end'
                }}
              >
                {getStatusChip(record.status, record.late_minutes)}

                {record.check_in_time && (
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    Checked in at {formatTime(record.check_in_time)}
                  </Typography>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', py: 2 }}
        >
          No attendance records yet
        </Typography>
      )}
    </Paper>
  );
};

export default RecentAttendanceList;