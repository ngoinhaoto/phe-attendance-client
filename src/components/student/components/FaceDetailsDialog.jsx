import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Alert
} from '@mui/material';
import { DeleteOutline as DeleteIcon } from '@mui/icons-material';
import { formatDate } from '../../../utils/dateUtils';

const FaceDetailsDialog = ({ open, face, onClose, onDelete }) => {
  if (!face) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Face Registration Details</DialogTitle>
      <DialogContent>
        {face.image ? (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <img
              src={`data:image/jpeg;base64,${face.image}`}
              alt="Registered Face"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            No image available for this face registration.
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Registration ID
            </Typography>
            <Typography variant="body1">{face.id}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Registration Date
            </Typography>
            <Typography variant="body1">
              {formatDate(face.created_at)}
            </Typography>
          </Grid>
          {face.confidence_score && (
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Confidence Score
              </Typography>
              <Typography variant="body1">
                {(face.confidence_score * 100).toFixed(1)}%
              </Typography>
            </Grid>
          )}
          {face.device_id && (
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Device
              </Typography>
              <Typography variant="body1">
                {face.device_id}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(face.id)}
        >
          Delete Registration
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FaceDetailsDialog;