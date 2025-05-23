import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Chip,
} from "@mui/material";
import adminService from "../../api/adminService";

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await adminService.getClasses();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Classes Management
      </Typography>

      <Box sx={{ display: "flex", mb: 3, gap: 2 }}>
        <TextField
          label="Search Classes"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" color="primary">
          Add New Class
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredClasses.map((cls) => (
            <Grid item xs={12} sm={6} md={4} key={cls.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {cls.name}
                  </Typography>
                  {cls.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {cls.description}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Teacher:{" "}
                      {cls.teacher?.full_name ||
                        cls.teacher?.username ||
                        "Not assigned"}
                    </Typography>
                    <Typography variant="body2">
                      Students: {cls.students?.length || 0}
                    </Typography>
                    <Typography variant="body2">
                      Sessions: {cls.sessions?.length || 0}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small">View Details</Button>
                  <Button size="small">Edit</Button>
                  <Button size="small" color="error">
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {filteredClasses.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography>No classes found</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default ClassesList;
