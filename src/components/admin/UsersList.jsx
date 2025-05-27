import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";

// Import custom hook
import useUsers from "../../hooks/useUsers";

// Import components
import UserCards from "./users/UserCards";
import UsersTable from "./users/UsersTable";
import UserDetailsDialog from "./users/UserDetailsDialog";
import AddUserDialog from "./users/AddUserDialog";
import DeleteUserDialog from "./users/DeleteUserDialog";
import EditUserDialog from "./users/EditUserDialog";

const UsersList = () => {
  const {
    paginatedUsers,
    filteredUsers,
    loading,
    error,
    filterRole,
    searchTerm,
    page,
    rowsPerPage,
    setFilterRole,
    setSearchTerm,
    fetchUsers,
    deleteUser,
    createUser,
    updateUser,
    handleChangePage,
    handleChangeRowsPerPage,
  } = useUsers();

  // UI state
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  // Add a loading state for operations
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  // Handlers
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setOpenDetailsDialog(true);
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleOpenEditDialog = (user) => {
    setUserToEdit(user);
    setOpenEditDialog(true);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRoleFilterChange = (event) => {
    setFilterRole(event.target.value);
  };

  // Update the updateUser handler
  const handleUpdateUser = async (userId, userData) => {
    setIsOperationLoading(true);
    try {
      const result = await updateUser(userId, userData);
      if (result === true) {
        setOpenEditDialog(false);
        setUserToEdit(null);
      }
      return result;
    } finally {
      setIsOperationLoading(false);
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
        <Button variant="contained" onClick={handleOpenAddDialog}>
          Add User
        </Button>
        <Button variant="contained" onClick={fetchUsers}>
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : paginatedUsers.length > 0 ? (
        <>
          <UserCards
            users={paginatedUsers}
            onViewDetails={handleViewDetails}
            onEditUser={handleOpenEditDialog}
            onDeleteUser={handleOpenDeleteDialog}
          />

          <Box sx={{ mt: 3 }}>
            <UsersTable
              users={paginatedUsers}
              totalCount={filteredUsers.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              onViewDetails={handleViewDetails}
              onEditUser={handleOpenEditDialog}
              onDeleteUser={handleOpenDeleteDialog}
            />
          </Box>
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

      {/* Dialogs */}
      <UserDetailsDialog
        open={openDetailsDialog}
        user={selectedUser}
        onClose={() => setOpenDetailsDialog(false)}
        onDelete={handleOpenDeleteDialog}
        onEdit={handleOpenEditDialog} // Add this prop
      />

      <AddUserDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAddUser={createUser}
      />

      <DeleteUserDialog
        open={openDeleteDialog}
        user={userToDelete}
        onClose={() => {
          setOpenDeleteDialog(false);
          setUserToDelete(null);
        }}
        onDelete={deleteUser}
      />

      <EditUserDialog
        open={openEditDialog}
        user={userToEdit}
        onClose={() => {
          setOpenEditDialog(false);
          setUserToEdit(null);
        }}
        onUpdateUser={handleUpdateUser}
        isLoading={isOperationLoading} // Pass the loading state
      />
    </Box>
  );
};

export default UsersList;
