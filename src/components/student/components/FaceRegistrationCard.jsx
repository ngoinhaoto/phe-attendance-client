import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  IconButton
} from '@mui/material';
import {
  Photo as CameraIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { formatDate } from '../../../utils/dateUtils';

const FaceRegistrationCard = ({ 
  registeredFaces, 
  openFaceRegistrationDialog, 
  openFaceDetails, 
  deleteFace 
}) => {
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
        <Typography variant="h6">Face Registration</Typography>
        <Button
          variant="contained"
          startIcon={<CameraIcon />}
          onClick={openFaceRegistrationDialog}
        >
          Register New Face
        </Button>
      </Box>

      {registeredFaces.length === 0 ? (
        <Alert severity="info">
          You haven't registered any faces yet. Register your face to use the
          facial recognition attendance system.
        </Alert>
      ) : (
        <>
          <Typography variant="body2" gutterBottom>
            You have {registeredFaces.length} registered face
            {registeredFaces.length !== 1 ? 's' : ''}. For best recognition
            results, register multiple angles in different lighting conditions.
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {registeredFaces.map((face) => (
              <Grid item xs={12} sm={6} md={4} key={face.id}>
                <Card
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                  onClick={() => openFaceDetails(face)}
                >
                  {face.image && (
                    <Box
                      sx={{
                        height: 160,
                        overflow: 'hidden',
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        position: 'relative'
                      }}
                    >
                      <img
                        src={`data:image/jpeg;base64,${face.image}`}
                        alt="Registered Face"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          borderRadius: '50%'
                        }}
                      >
                        <IconButton
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFace(face.id);
                          }}
                          title="Delete this face registration"
                          sx={{ color: 'white' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                  <CardContent sx={{ py: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box>
                        <Typography variant="body2">Registered on</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDate(face.created_at)}
                        </Typography>
                        {face.confidence_score && (
                          <Typography variant="caption" color="text.secondary">
                            Confidence: {(face.confidence_score * 100).toFixed(1)}%
                          </Typography>
                        )}
                      </Box>
                      {!face.image && (
                        <IconButton
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFace(face.id);
                          }}
                          title="Delete this face registration"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Paper>
  );
};

export default FaceRegistrationCard;