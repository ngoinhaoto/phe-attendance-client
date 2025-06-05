import apiService from "./apiService";
import { jwtDecode } from "jwt-decode";

const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  try {
    const response = await apiService.post("/auth/token", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);

      try {
        // Extract information from the token
        const decoded = jwtDecode(response.data.access_token);

        // Get user by ID - this will work regardless of role
        const userResponse = await apiService.get(`/users/${decoded.user_id}`);

        if (userResponse.data) {
          localStorage.setItem("user", JSON.stringify(userResponse.data));
          return userResponse.data;
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);

        // If the above fails, use a different approach for students
        try {
          // Create a basic user object from the token
          const decoded = jwtDecode(response.data.access_token);

          // Construct minimal user object
          const basicUser = {
            username: decoded.sub,
            role: decoded.role || "student", // Use role from token if available
            id: decoded.user_id,
            token: response.data.access_token,
          };

          localStorage.setItem("user", JSON.stringify(basicUser));
          return basicUser;
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Update the logout function

const logout = (redirect = true) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Optional redirect parameter allows for flexibility
  if (redirect) {
    window.location.href = "/login";
  }
};

const authService = {
  login,
  logout,
};

export default authService;
