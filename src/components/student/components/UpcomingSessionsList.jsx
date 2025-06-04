import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material';
import { Class as ClassIcon } from '@mui/icons-material';
import { formatDate, formatTime } from '../../../utils/dateUtils';

const UpcomingSessionsList = ({ sessions, onCheckIn }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Typography variant="h6">Upcoming Sessions</Typography>
        <Button variant="contained" color="primary" onClick={onCheckIn}>
          Check In
        </Button>
      </Box>

      {sessions.length > 0 ? (
        <List>
          {sessions.map((session) => (
            <ListItem key={session.id} divider>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ClassIcon color="primary" fontSize="small" />
                    <Typography variant="body1">
                      {session.className} ({session.classCode})
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                    <Typography variant="body2">
                      {formatDate(session.session_date)}
                    </Typography>
                    <Typography variant="body2">
                      {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', py: 2 }}
        >
          No upcoming sessions
        </Typography>
      )}
    </Paper>
  );
};

export default UpcomingSessionsList;