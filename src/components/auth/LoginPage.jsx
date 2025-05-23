import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { login } from "../../features/auth/authSlice";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, error } = useSelector(
    (state) => state.auth,
  );

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values) => {
    await dispatch(login(values));
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Face Attendance System
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, handleChange, handleBlur, values }) => (
              <Form>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.username && Boolean(errors.username)}
                  helperText={touched.username && errors.username}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : "Sign In"}
                </Button>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
