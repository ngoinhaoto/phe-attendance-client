import { format } from 'date-fns';

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'MMMM d, yyyy');
  } catch (error) {
    return dateStr;
  }
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'h:mm a');
  } catch (error) {
    return dateStr;
  }
};