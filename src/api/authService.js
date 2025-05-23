import apiService from "./apiService";
import { jwtDecode } from "jwt-decode";

const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await apiService.post("/auth/token", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);

    try {
      // Extract the username from the token
      const decoded = jwtDecode(response.data.access_token);
      const username = decoded.sub;

      // Fetch the user details using their username
      const usersResponse = await apiService.get("/users", {
        params: { username: username },
      });

      // Find the user in the response
      const user = usersResponse.data.find((u) => u.username === username);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        return user;
      } else {
        // Fallback basic user info
        return {
          username: username,
          token: response.data.access_token,
        };
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Return basic info based on token
      return {
        token: response.data.access_token,
        // You might need to add jwt-decode library to extract more info
        // from the token if needed
      };
    }
  }

  return null;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const authService = {
  login,
  logout,
};

export default authService;
