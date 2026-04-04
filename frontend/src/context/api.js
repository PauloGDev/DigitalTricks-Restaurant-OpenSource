import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // URL do seu backend Spring
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para enviar o token JWT se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
