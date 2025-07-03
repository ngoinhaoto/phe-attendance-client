import axios from "axios";

// Get microservice URL from environment or use default
const baseURL = process.env.REACT_APP_PHE_ONPREM_URL || "http://localhost:8001";

const pheMicroserviceClient = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds default timeout
  headers: {
    Accept: "application/json",
  },
});

pheMicroserviceClient.interceptors.request.use(
  (config) => {
    console.log(
      `PHE Microservice Request: ${config.method.toUpperCase()} ${config.url}`,
    );
    // Don't log the entire FormData for privacy reasons
    if (config.data instanceof FormData) {
      console.log("FormData payload included");
    }
    return config;
  },
  (error) => {
    console.error("PHE Microservice Request Error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for debugging
pheMicroserviceClient.interceptors.response.use(
  (response) => {
    console.log(`PHE Microservice Response Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error("PHE Microservice Error:", error.message);

    if (error.response) {
      console.error(`Error Status: ${error.response.status}`);
      console.error("Error Response Data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    }

    return Promise.reject(error);
  },
);

export default pheMicroserviceClient;
