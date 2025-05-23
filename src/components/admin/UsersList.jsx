import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Grid,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AssignmentInd as RoleIcon,
  VerifiedUser as StatusIcon,
} from "@mui/icons-material";
import adminService from "../../api/adminService";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterRole, setFilterRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filterRole) {
        params.role = filterRole;
      }
      const data = await adminService.getUsers(params);
      console.log("Fetched users:", data); // Add this to debug
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again later.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRoleFilterChange = (event) => {
    setFilterRole(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name &&
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Pagination
  const displayedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "teacher":
        return "primary";
      case "student":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Users Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", mb: 3, gap: 2 }}>
        <TextField
          label="Search Users"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Role</InputLabel>
          <Select
            value={filterRole}
            label="Filter by Role"
            onChange={handleRoleFilterChange}
          >
            <MenuItem value="">
              <em>All Roles</em>
            </MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="student">Student</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => fetchUsers()}>
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : displayedUsers.length > 0 ? (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {displayedUsers.slice(0, 4).map((user) => (
              <Grid item xs={12} sm={6} md={3} key={`card-${user.id}`}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderLeft: `4px solid ${
                      user.role === "admin"
                        ? "#f44336"
                        : user.role === "teacher"
                        ? "#1976d2"
                        : "#4caf50"
                    }`,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1.5,
                        gap: 1,
                      }}
                    >
                      <PersonIcon sx={{ color: "text.secondary" }} />
                      <Typography variant="h6" component="div" noWrap>
                        {user.username}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                        gap: 1,
                      }}
                    >
                      <EmailIcon sx={{ color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {user.email}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                        gap: 1,
                      }}
                    >
                      <RoleIcon sx={{ color: "text.secondary" }} />
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <StatusIcon sx={{ color: "text.secondary" }} />
                      <Chip
                        label={user.is_active ? "Active" : "Inactive"}
                        color={user.is_active ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <Box
                    sx={{
                      p: 1,
                      pt: 0,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(user)}
                      >
                        <PersonIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit User">
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ width: "100%", mb: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedUsers.map((user) => (
                    <TableRow key={`row-${user.id}`}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.full_name || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? "Active" : "Inactive"}
                          color={user.is_active ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(user)}
                          >
                            <PersonIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography>No users found</Typography>
          {searchTerm && (
            <Typography variant="body2" color="textSecondary">
              Try changing your search or filters
            </Typography>
          )}
        </Paper>
      )}

      {/* User Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>User Details: {selectedUser.username}</DialogTitle>
            <DialogContent>
              <DialogContentText component="div">
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Username</Typography>
                    <Typography variant="body1">
                      {selectedUser.username}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Full Name</Typography>
                    <Typography variant="body1">
                      {selectedUser.full_name || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Email</Typography>
                    <Typography variant="body1">
                      {selectedUser.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Role</Typography>
                    <Chip
                      label={selectedUser.role}
                      color={getRoleColor(selectedUser.role)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Status</Typography>
                    <Chip
                      label={selectedUser.is_active ? "Active" : "Inactive"}
                      color={selectedUser.is_active ? "success" : "default"}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Created At</Typography>
                    <Typography variant="body1">
                      {new Date(selectedUser.created_at).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button variant="contained">Edit User</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default UsersList;
