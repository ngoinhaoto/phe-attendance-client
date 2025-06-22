import apiService from "./apiService";

/**
 * Update user information including password
 * @param {number} userId - The ID of the user to update
 * @param {object} userData - The user data to update (can include password)
 * @returns {Promise<object>} - The updated user object
 */
const updateUser = async (userId, userData) => {
  try {
    const response = await apiService.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

/**
 * Verify if the current password is correct
 * @param {string} password - The password to verify
 * @returns {Promise<boolean>} - True if password is valid, false otherwise
 */
const verifyPassword = async (password) => {
  try {
    const response = await apiService.post(`/auth/verify-password`, { password });
    return response.data.valid;
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error;
  }
};

/**
 * Change user password with verification
 * @param {number} userId - The ID of the user
 * @param {string} currentPassword - The current password
 * @param {string} newPassword - The new password
 * @returns {Promise<object>} - The updated user object
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // First verify the current password
    const isValid = await verifyPassword(currentPassword);
    
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }
    
    // If password is valid, update to the new password
    return await updateUser(userId, { password: newPassword });
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

const userService = {
  updateUser,
  changePassword,
  verifyPassword,
};

export default userService;
