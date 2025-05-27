import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";

const ClassDeleteDialog = ({ open, classData, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await onDelete(classData.id);
      if (success) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!classData) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Class Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the class "{classData.name}" ({classData.class_code})? 
          This action cannot be undone and will remove all associated sessions and attendance records.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={isDeleting}
        >
          {isDeleting ? <CircularProgress size={24} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassDeleteDialog;