import axios from "axios";

const apiRequest = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

export default apiRequest;
