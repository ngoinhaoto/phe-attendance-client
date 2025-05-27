import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
} from "@mui/material";

const ClassCard = ({
  classData,
  teachers,
  onEdit,
  onDelete,
  onManageStudents,
  onManageSessions,
}) => {
  // Function to get teacher's name by ID
  const getTeacherName = (teacherObj, teacherId) => {
    // If we have the full teacher object with name, use it
    if (teacherObj?.full_name || teacherObj?.username) {
      return teacherObj.full_name || teacherObj.username;
    }

    // If we only have the teacher_id, look up the teacher in our teachers array
    if (teacherId) {
      const foundTeacher = teachers.find((t) => t.id === Number(teacherId));
      if (foundTeacher) {
        return foundTeacher.full_name || foundTeacher.username;
      }
    }

    // If no teacher info is available
    return "Not assigned";
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div">
          {classData.name}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {classData.class_code}
        </Typography>
        {classData.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {classData.description}
          </Typography>
        )}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Teacher: {getTeacherName(classData.teacher, classData.teacher_id)}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              my: 1,
            }}
          >
            <Typography variant="body2">Students:</Typography>
            <Chip
              size="small"
              label={
                Array.isArray(classData.students)
                  ? classData.students.length
                  : 0
              }
              color={
                Array.isArray(classData.students) &&
                classData.students.length > 0
                  ? "primary"
                  : "default"
              }
              onClick={() => onManageStudents(classData)}
            />
          </Box>
          <Typography variant="body2">
            Sessions:{" "}
            {Array.isArray(classData.sessions) ? classData.sessions.length : 0}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small">View Details</Button>
        <Button size="small" onClick={() => onEdit(classData)}>
          Edit
        </Button>
        <Button
          size="small"
          color="primary"
          onClick={() => onManageStudents(classData)}
        >
          Students
        </Button>
        <Button
          size="small"
          color="secondary"
          onClick={() => onManageSessions(classData)}
        >
          Sessions
        </Button>
        <Button size="small" color="error" onClick={() => onDelete(classData)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default ClassCard;
