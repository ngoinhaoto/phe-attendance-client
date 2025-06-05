import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const apiService = axios.create({
  baseURL,
  timeout: 15000,
});

// Add a request interceptor that handles auth tokens
apiService.interceptors.request.use(
  (config) => {
    // Don't add auth headers for public endpoints
    if (config.url.includes("/public") || config.url.includes("/guest-")) {
      return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Export the service
export default apiService;
