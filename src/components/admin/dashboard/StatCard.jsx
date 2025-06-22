import React from 'react';
import { Card, CardContent, Box, Typography, alpha } from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Class as ClassIcon,
  School as SchoolIcon,
  PersonAdd as TeacherIcon,
} from "@mui/icons-material";

const StatCard = ({ card }) => {
  // Function to get the right icon based on the type
  const getIcon = (iconType) => {
    switch (iconType) {
      case 'people':
        return <PeopleIcon sx={{ fontSize: 40 }} />;
      case 'class':
        return <ClassIcon sx={{ fontSize: 40 }} />;
      case 'school':
        return <SchoolIcon sx={{ fontSize: 40 }} />;
      case 'teacher':
        return <TeacherIcon sx={{ fontSize: 40 }} />;
      default:
        return <PeopleIcon sx={{ fontSize: 40 }} />;
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${alpha(
          card.color,
          0.1,
        )} 0%, ${alpha(card.color, 0.05)} 100%)`,
        border: `1px solid ${alpha(card.color, 0.1)}`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "5px",
          height: "100%",
          background: card.color,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              {card.title}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: card.color }}
            >
              {card.value}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: alpha(card.color, 0.1),
              color: card.color,
            }}
          >
            {getIcon(card.icon)}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;