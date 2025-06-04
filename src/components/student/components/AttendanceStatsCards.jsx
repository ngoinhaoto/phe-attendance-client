import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

const AttendanceStatsCards = ({ stats }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Attendance Rate
            </Typography>
            <Typography variant="h3" color="primary">
              {stats.attendanceRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on {stats.total} total sessions
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Present
            </Typography>
            <Typography variant="h3" color="success.main">
              {stats.present}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.total > 0
                ? `${((stats.present / stats.total) * 100).toFixed(1)}% of total`
                : 'No sessions yet'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Late
            </Typography>
            <Typography variant="h3" color="warning.main">
              {stats.late}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.total > 0
                ? `${((stats.late / stats.total) * 100).toFixed(1)}% of total`
                : 'No sessions yet'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Absent
            </Typography>
            <Typography variant="h3" color="error.main">
              {stats.absent}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.total > 0
                ? `${((stats.absent / stats.total) * 100).toFixed(1)}% of total`
                : 'No sessions yet'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AttendanceStatsCards;