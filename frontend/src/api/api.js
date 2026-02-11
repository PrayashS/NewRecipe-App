import axios from "axios";

// Use environment variable for production, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

console.log("API URL:", API_URL); // For debugging

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
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

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
  verify: () => api.get("/auth/verify"),
  changePassword: (currentPassword, newPassword) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),
};

export const recipeAPI = {
  getAll: () => api.get("/recipes"),
  getOne: (id) => api.get(`/recipes/${id}`),
  create: (data) => api.post("/recipes", data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
};

export default api;
