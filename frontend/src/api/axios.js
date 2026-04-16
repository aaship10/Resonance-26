// src/api/axios.js
import axios from 'axios';

// Create a custom Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // Your FastAPI server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// The Interceptor: Automatically attach the JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global Error Handler (Optional but great for Hackathons)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the backend says the token is expired, clear it and force login
      console.error("Authentication expired. Please log in again.");
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      // window.location.href = '/login'; // Uncomment this after we build the router!
    }
    return Promise.reject(error);
  }
);

export default apiClient;